from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.research_api import service
from app.research_api.schemas import (
    AuthorCreate,
    AuthorResponse,
    PaperCreate,
    PaperResponse,
    PaperUpdate,
    ResearchOutputTypeCreate,
    ResearchOutputTypeResponse,
    ResearchTypeCreate,
    ResearchTypeResponse,
)
from database.database import get_db


router = APIRouter(prefix="/research", tags=["Research"])

DbSession = Annotated[object, Depends(get_db)]
SkipParam = Annotated[int, Query(ge=0)]
LimitParam = Annotated[int, Query(ge=1, le=100)]
QParam = Annotated[str | None, Query()]
ResearchResourcesParam = Annotated[str, Query()]


@router.get("/collections", response_model=dict[str, list[dict]])
def get_research_collections(
    db: DbSession,
    resources: ResearchResourcesParam = "types",
    q: QParam = None,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    allowed = {"types", "output_types", "authors", "papers"}
    selected = [item.strip().lower() for item in resources.split(",") if item.strip()]

    if not selected:
        raise HTTPException(status_code=400, detail="resources cannot be empty")

    invalid = [item for item in selected if item not in allowed]
    if invalid:
        raise HTTPException(status_code=400, detail=f"Invalid resources: {', '.join(invalid)}")

    data: dict[str, list[dict]] = {}

    if "types" in selected:
        data["types"] = service.list_research_types(db)
    if "output_types" in selected:
        data["output_types"] = service.list_research_output_types(db)
    if "authors" in selected:
        data["authors"] = service.list_authors(db, skip, limit)
    if "papers" in selected:
        data["papers"] = service.list_papers(db, q, skip, limit)

    return data


# ============================================================
# Research Types
# ============================================================


@router.post("/types", response_model=ResearchTypeResponse)
def create_research_type(
    payload: ResearchTypeCreate,
    db: DbSession,
):
    return service.create_research_type(db, payload.name, payload.description)


@router.get("/types", response_model=list[ResearchTypeResponse])
def list_research_types(
    db: DbSession,
):
    return service.list_research_types(db)


# ============================================================
# Research Output Types
# ============================================================


@router.post("/output-types", response_model=ResearchOutputTypeResponse)
def create_research_output_type(
    payload: ResearchOutputTypeCreate,
    db: DbSession,
):
    return service.create_research_output_type(db, payload.name, payload.description)


@router.get("/output-types", response_model=list[ResearchOutputTypeResponse])
def list_research_output_types(
    db: DbSession,
):
    return service.list_research_output_types(db)


# ============================================================
# Authors
# ============================================================


@router.post("/authors", response_model=AuthorResponse)
def create_author(
    payload: AuthorCreate,
    db: DbSession,
):
    return service.create_author(db, payload)


@router.get("/authors", response_model=list[AuthorResponse])
def list_authors(
    db: DbSession,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return service.list_authors(db, skip, limit)


# ============================================================
# Papers
# ============================================================


@router.post("/papers", response_model=PaperResponse)
def create_paper(
    payload: PaperCreate,
    db: DbSession,
):
    return service.create_paper(db, payload)


@router.get("/papers", response_model=list[PaperResponse])
def list_papers(
    db: DbSession,
    q: QParam = None,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return service.list_papers(db, q, skip, limit)


@router.get("/papers/{paper_id}", response_model=PaperResponse)
def get_paper(
    paper_id: int,
    db: DbSession,
):
    return service.get_paper(db, paper_id)


@router.put("/papers/{paper_id}", response_model=PaperResponse)
def update_paper(
    paper_id: int,
    payload: PaperUpdate,
    db: DbSession,
):
    return service.update_paper(db, paper_id, payload)


@router.delete("/papers/{paper_id}", status_code=204)
def delete_paper(
    paper_id: int,
    db: DbSession,
):
    service.delete_paper(db, paper_id)
    return None
