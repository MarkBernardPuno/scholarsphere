from fastapi import HTTPException
from psycopg2 import Error

from app.auth import create_access_token, hash_password, verify_password
from app.auth_api.schemas import LoginRequest, SignupRequest, TokenResponse
from app.db_errors import raise_db_http_error
from database.database import fetch_one


def _assert_lookup_exists(db, table: str, column: str, value: int, label: str):
    row = fetch_one(db, f"SELECT {column} FROM {table} WHERE {column} = %s", (value,))
    if not row:
        raise HTTPException(status_code=400, detail=f"{label} not found")
    return row


def _assert_college_in_campus(db, college_id: int, campus_id: int):
    row = fetch_one(
        db,
        """
        SELECT college_id
        FROM colleges
        WHERE college_id = %s AND campus_id = %s
        """,
        (college_id, campus_id),
    )
    if not row:
        raise HTTPException(status_code=400, detail="College does not belong to the selected campus")


def _assert_department_in_college(db, department_id: int, college_id: int):
    row = fetch_one(
        db,
        """
        SELECT department_id
        FROM departments
        WHERE department_id = %s AND college_id = %s
        """,
        (department_id, college_id),
    )
    if not row:
        raise HTTPException(status_code=400, detail="Department does not belong to the selected college")


def signup_user(db, payload: SignupRequest):
    existing = fetch_one(db, "SELECT user_id FROM users WHERE email = %s", (payload.email,))
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    _assert_lookup_exists(db, "campuses", "campus_id", payload.campus_id, "Campus")
    _assert_college_in_campus(db, payload.college_id, payload.campus_id)

    if payload.department_id is not None:
        _assert_department_in_college(db, payload.department_id, payload.college_id)

    try:
        user = fetch_one(
            db,
            """
            INSERT INTO users (
                first_name,
                middle_initial,
                last_name,
                email,
                password_hash,
                campus_id,
                college_id,
                department_id
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING
                user_id,
                first_name,
                middle_initial,
                last_name,
                email,
                campus_id,
                college_id,
                department_id,
                created_at
            """,
            (
                payload.first_name.strip(),
                (payload.middle_initial or "").strip() or None,
                payload.last_name.strip(),
                payload.email.strip().lower(),
                hash_password(payload.password),
                payload.campus_id,
                payload.college_id,
                payload.department_id,
            ),
        )
        db.commit()
        full_name_parts = [
            user["first_name"],
            f"{user['middle_initial'].strip()}." if user["middle_initial"] else None,
            user["last_name"],
        ]
        user["full_name"] = " ".join(part for part in full_name_parts if part)
        return user
    except Error as exc:
        raise_db_http_error(db, exc, conflict_detail="Email already registered")


def login_user(db, payload: LoginRequest) -> TokenResponse:
    user = fetch_one(
        db,
        """
        SELECT user_id, email, password_hash
        FROM users
        WHERE email = %s
        """,
        (payload.email.strip().lower(),),
    )
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(int(user["user_id"]), user["email"])
    return TokenResponse(access_token=token)
