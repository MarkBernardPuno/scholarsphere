from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.users_api import service
from app.users_api.schemas import UserResponse
from database.database import get_db


router = APIRouter(prefix="/users", tags=["Users"])

DbSession = Annotated[object, Depends(get_db)]
SkipParam = Annotated[int, Query(ge=0)]
LimitParam = Annotated[int, Query(ge=1, le=100)]


@router.get("/collections", response_model=dict[str, list[dict]])
def get_user_collections(
    db: DbSession,
    skip: SkipParam = 0,
    limit: LimitParam = 20,
):
    return {
        "users": service.list_users(db, skip, limit),
    }


@router.get("/", response_model=list[UserResponse])
def list_users(
    db: DbSession,
    skip: SkipParam = 0,
    limit: LimitParam = 20,
):
    return service.list_users(db, skip, limit)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: DbSession,
):
    return service.get_user(db, user_id)
