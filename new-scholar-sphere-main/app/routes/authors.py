from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.authors_api import service
from app.authors_api.schemas import AuthorCreate, AuthorResponse, AuthorUpdate
from database.database import get_db


router = APIRouter(prefix="/authors", tags=["Authors"])

DbSession = Annotated[object, Depends(get_db)]
SkipParam = Annotated[int, Query(ge=0)]
LimitParam = Annotated[int, Query(ge=1, le=100)]
SearchParam = Annotated[str | None, Query()]


@router.get("/collections", response_model=dict[str, list[dict]])
def get_author_collections(
    db: DbSession,
    search: SearchParam = None,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return {
        "authors": service.list_authors(db, search, skip, limit),
    }


@router.post("/", response_model=AuthorResponse, status_code=status.HTTP_201_CREATED)
def create_author(
    payload: AuthorCreate,
    db: DbSession,
):
    return service.create_author(db, payload)


@router.get("/", response_model=list[AuthorResponse])
def list_authors(
    db: DbSession,
    search: SearchParam = None,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return service.list_authors(db, search, skip, limit)


@router.get("/{author_id}", response_model=AuthorResponse)
def get_author(
    author_id: int,
    db: DbSession,
):
    return service.get_author(db, author_id)


@router.put("/{author_id}", response_model=AuthorResponse)
def update_author(
    author_id: int,
    payload: AuthorUpdate,
    db: DbSession,
):
    return service.update_author(db, author_id, payload)


@router.delete("/{author_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_author(
    author_id: int,
    db: DbSession,
):
    service.delete_author(db, author_id)
    return None
