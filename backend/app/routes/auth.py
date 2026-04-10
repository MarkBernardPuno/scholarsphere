from fastapi import APIRouter, Depends, Query, status

from app.auth_api import service
from app.auth_api.schemas import LoginRequest, SignupRequest, TokenResponse
from app.users_api import service as users_service
from app.users_api.schemas import UserResponse
from database.database import get_db


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db=Depends(get_db)):
    return service.signup_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db=Depends(get_db)):
    return service.login_user(db, payload)


@router.get("/me", response_model=UserResponse)
def me(user_id: int = Query(..., ge=1), db=Depends(get_db)):
    return users_service.get_user(db, user_id)
