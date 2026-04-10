from fastapi import HTTPException

from database.database import fetch_all, fetch_one


def _select_user_base() -> str:
    return """
        SELECT
            user_id,
            first_name,
            middle_initial,
            last_name,
            CONCAT_WS(
                ' ',
                first_name,
                NULLIF(middle_initial, ''),
                last_name
            ) AS full_name,
            email,
            campus_id,
            college_id,
            department_id,
            created_at
        FROM users
    """


def list_users(db, skip: int, limit: int):
    return fetch_all(
        db,
        _select_user_base() + """
        ORDER BY created_at DESC
        OFFSET %s LIMIT %s
        """,
        (skip, limit),
    )


def get_user(db, user_id: int):
    user = fetch_one(
        db,
        _select_user_base() + " WHERE user_id = %s",
        (user_id,),
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
