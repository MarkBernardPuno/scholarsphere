from typing import Annotated

from fastapi import APIRouter, Depends, Form, Query, status

from app.research_repository_api import service
from database.database import get_db


router = APIRouter(prefix="/research-database", tags=["Research Repository"])

DbSession = Annotated[object, Depends(get_db)]
SkipParam = Annotated[int, Query(ge=0)]
LimitParam = Annotated[int, Query(ge=1, le=100)]
SearchParam = Annotated[str | None, Query()]
OutputTypeParam = Annotated[str | None, Query()]


@router.get("", response_model=list[dict])
@router.get("/", response_model=list[dict])
def list_research_repository_submissions(
    db: DbSession,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
    search: SearchParam = None,
    output_type: OutputTypeParam = None,
):
    return service.list_repository_submissions(db, skip, limit, search, output_type)


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_research_repository_submission(
    db: DbSession,
    user_id: str | None = Form(default=None),
    title: str = Form(...),
    research_type_id: str | None = Form(default=None),
    research_output_type_id: str | None = Form(default=None),
    output_type: str | None = Form(default=None),
    department_id: str | None = Form(default=None),
    school_year_id: str | None = Form(default=None),
    semester_id: str | None = Form(default=None),
    authors: str | None = Form(default=None),
    conference_name: str | None = Form(default=None),
    presentation_date: str | None = Form(default=None),
    presentation_venue: str | None = Form(default=None),
    journal_publisher: str | None = Form(default=None),
    issue_number: str | None = Form(default=None),
    volume: str | None = Form(default=None),
    doi: str | None = Form(default=None),
    manuscript_link: str | None = Form(default=None),
    status_value: str | None = Form(default=None),
):
    payload = {
        "user_id": user_id,
        "title": title,
        "research_type_id": research_type_id,
        "research_output_type_id": research_output_type_id,
        "output_type": output_type,
        "department_id": department_id,
        "school_year_id": school_year_id,
        "semester_id": semester_id,
        "authors": authors,
        "conference_name": conference_name,
        "presentation_date": presentation_date,
        "presentation_venue": presentation_venue,
        "journal_publisher": journal_publisher,
        "issue_number": issue_number,
        "volume": volume,
        "doi": doi,
        "manuscript_link": manuscript_link,
        "status": status_value,
    }
    return service.create_repository_submission(db, payload)


@router.delete("/{repository_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_research_repository_submission(
    repository_id: int,
    db: DbSession,
):
    service.delete_repository_submission(db, repository_id)
    return None
