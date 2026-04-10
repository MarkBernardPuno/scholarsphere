import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import load_backend_env
from database.database import fetch_one, get_db


load_backend_env()


# Use a stable default hash scheme; keep bcrypt verification support for legacy hashes.
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Local fallback to avoid auth hard-failure when env loading is inconsistent.
DEV_JWT_FALLBACK_SECRET = "scholar-sphere-dev-fallback-secret"


def get_jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY")
    if secret:
        return secret
    return DEV_JWT_FALLBACK_SECRET


def get_jwt_algorithm() -> str:
    return os.getenv("JWT_ALGORITHM", "HS256")


def get_token_expiry_minutes() -> int:
    raw_value = os.getenv("JWT_EXPIRE_MINUTES", "60")
    try:
        return int(raw_value)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT_EXPIRE_MINUTES must be an integer",
        ) from exc


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: int, email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": now,
        "exp": now + timedelta(minutes=get_token_expiry_minutes()),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=get_jwt_algorithm())


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, get_jwt_secret(), algorithms=[get_jwt_algorithm()])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)) -> dict:
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        parsed_user_id = int(user_id)
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user = fetch_one(
        db,
        """
        SELECT
            user_id,
            first_name,
            middle_initial,
            last_name,
            email,
            password_hash,
            created_at
        FROM users
        WHERE user_id = %s
        """,
        (parsed_user_id,),
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    full_name_parts = [
        user["first_name"],
        f"{user['middle_initial'].strip()}." if user.get("middle_initial") else None,
        user["last_name"],
    ]
    user["full_name"] = " ".join(part for part in full_name_parts if part)
    return user
