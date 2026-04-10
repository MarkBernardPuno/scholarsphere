from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.presentations_api import service
from app.presentations_api.schemas import PresentationCreate, PresentationResponse, PresentationUpdate
from database.database import get_db


router = APIRouter(prefix="/presentations", tags=["Presentations"])

DbSession = Annotated[object, Depends(get_db)]
SkipParam = Annotated[int, Query(ge=0)]
LimitParam = Annotated[int, Query(ge=1, le=100)]
PaperFilterParam = Annotated[int | None, Query(ge=1)]


@router.get("/collections", response_model=dict[str, list[dict]])
def get_presentation_collections(
    db: DbSession,
    paper_id: PaperFilterParam = None,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return {
        "presentations": service.list_presentations(db, paper_id, skip, limit),
    }


@router.post("/", response_model=PresentationResponse, status_code=status.HTTP_201_CREATED)
def create_presentation(
    payload: PresentationCreate,
    db: DbSession,
):
    return service.create_presentation(db, payload)


@router.get("/", response_model=list[PresentationResponse])
def list_presentations(
    db: DbSession,
    paper_id: PaperFilterParam = None,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return service.list_presentations(db, paper_id, skip, limit)


@router.get("/{presentation_id}", response_model=PresentationResponse)
def get_presentation(
    presentation_id: int,
    db: DbSession,
):
    return service.get_presentation(db, presentation_id)


@router.put("/{presentation_id}", response_model=PresentationResponse)
def update_presentation(
    presentation_id: int,
    payload: PresentationUpdate,
    db: DbSession,
):
    return service.update_presentation(db, presentation_id, payload)


@router.delete("/{presentation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_presentation(
    presentation_id: int,
    db: DbSession,
):
    service.delete_presentation(db, presentation_id)
    return None
