from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from pathlib import Path
from pydantic import BaseModel

from app.research_evaluations import service
from database.database import get_db


router = APIRouter(prefix="/research-evaluations", tags=["Research Evaluations"])

DbSession = Annotated[object, Depends(get_db)]
SkipParam = Annotated[int, Query(ge=0)]
LimitParam = Annotated[int, Query(ge=1, le=100)]
PaperFilterParam = Annotated[int | None, Query(ge=1)]
StatusFilterParam = Annotated[str | None, Query()]
SearchFilterParam = Annotated[str | None, Query()]


class EvaluationStatusUpdatePayload(BaseModel):
    status: str | None = None
    status_value: str | None = None


class EvaluationTrackingUpdatePayload(BaseModel):
    status: str | None = None
    status_value: str | None = None
    statuses_and_remarks: str | None = None
    statuses_and_remarks_name: str | None = None
    remarks: str | None = None


@router.get("/collections", response_model=dict[str, list[dict]])
def get_research_evaluation_collections(
    db: DbSession,
    paper_id: PaperFilterParam = None,
    status_value: StatusFilterParam = None,
    search: SearchFilterParam = None,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    dropdowns = service.list_tracking_dropdowns(db)
    return {
        "research_evaluations": service.list_research_evaluations(
            db,
            paper_id,
            status_value,
            search,
            skip,
            limit,
        ),
        "status": dropdowns["status"],
        "statuses_and_remarks": dropdowns["statuses_and_remarks"],
    }


@router.get("/tracking-dropdowns", response_model=dict[str, list[dict]])
def get_tracking_dropdowns(
    db: DbSession,
):
    return service.list_tracking_dropdowns(db)


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_research_evaluation(
    db: DbSession,
    title_of_research: str = Form(...),
    author_id: str = Form(...),
    campus_id: str = Form(...),
    college_id: str = Form(...),
    department_id: str = Form(...),
    school_year_id: str = Form(...),
    semester_id: str = Form(...),
    appointment_date: str = Form(...),
    appointment_time: str = Form(...),
    remarks: str | None = Form(default=None),
    authorship_form: UploadFile | None = File(default=None),
    evaluation_form: UploadFile | None = File(default=None),
    full_paper: UploadFile | None = File(default=None),
    turnitin_report: UploadFile | None = File(default=None),
    grammarly_report: UploadFile | None = File(default=None),
    journal_conference_info: UploadFile | None = File(default=None),
    certificate_of_presentation: UploadFile | None = File(default=None),
    call_for_paper: UploadFile | None = File(default=None),
):
    payload = {
        "title_of_research": title_of_research,
        "author_id": author_id,
        "campus_id": campus_id,
        "college_id": college_id,
        "department_id": department_id,
        "school_year_id": school_year_id,
        "semester_id": semester_id,
        "appointment_date": appointment_date,
        "appointment_time": appointment_time,
        "remarks": remarks,
    }
    files = {
        "authorship_form": authorship_form,
        "evaluation_form": evaluation_form,
        "full_paper": full_paper,
        "turnitin_report": turnitin_report,
        "grammarly_report": grammarly_report,
        "journal_conference_info": journal_conference_info,
        "certificate_of_presentation": certificate_of_presentation,
        "call_for_paper": call_for_paper,
    }
    return service.create_research_evaluation_from_form(db, payload, files)


@router.get("/", response_model=list[dict])
def list_research_evaluations(
    db: DbSession,
    paper_id: PaperFilterParam = None,
    status_value: StatusFilterParam = None,
    search: SearchFilterParam = None,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return service.list_research_evaluations(
        db,
        paper_id,
        status_value,
        search,
        skip,
        limit,
    )


@router.get("/files/{file_name}")
def get_uploaded_evaluation_file(file_name: str):
    base = Path(__file__).resolve().parents[2] / "uploads" / "evaluation_files"
    file_path = (base / file_name).resolve()
    if not str(file_path).startswith(str(base.resolve())) or not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=file_path, filename=file_path.name)


@router.get("/{evaluation_id}", response_model=dict)
def get_research_evaluation(
    evaluation_id: int,
    db: DbSession,
):
    return service.get_research_evaluation(db, evaluation_id)


@router.put("/{evaluation_id}", response_model=dict)
def update_research_evaluation(
    evaluation_id: int,
    db: DbSession,
    title_of_research: str | None = Form(default=None),
    author_id: str | None = Form(default=None),
    campus_id: str | None = Form(default=None),
    college_id: str | None = Form(default=None),
    department_id: str | None = Form(default=None),
    school_year_id: str | None = Form(default=None),
    semester_id: str | None = Form(default=None),
    appointment_date: str | None = Form(default=None),
    appointment_time: str | None = Form(default=None),
    status_value: str | None = Form(default=None),
    status_text: str | None = Form(default=None, alias="status"),
    remarks: str | None = Form(default=None),
    authorship_form: UploadFile | None = File(default=None),
    evaluation_form: UploadFile | None = File(default=None),
    full_paper: UploadFile | None = File(default=None),
    turnitin_report: UploadFile | None = File(default=None),
    grammarly_report: UploadFile | None = File(default=None),
    journal_conference_info: UploadFile | None = File(default=None),
    certificate_of_presentation: UploadFile | None = File(default=None),
    call_for_paper: UploadFile | None = File(default=None),
):
    payload = {
        "title_of_research": title_of_research,
        "author_id": author_id,
        "campus_id": campus_id,
        "college_id": college_id,
        "department_id": department_id,
        "school_year_id": school_year_id,
        "semester_id": semester_id,
        "appointment_date": appointment_date,
        "appointment_time": appointment_time,
        "status": status_value or status_text,
        "remarks": remarks,
    }
    files = {
        "authorship_form": authorship_form,
        "evaluation_form": evaluation_form,
        "full_paper": full_paper,
        "turnitin_report": turnitin_report,
        "grammarly_report": grammarly_report,
        "journal_conference_info": journal_conference_info,
        "certificate_of_presentation": certificate_of_presentation,
        "call_for_paper": call_for_paper,
    }
    return service.update_research_evaluation_from_form(db, evaluation_id, payload, files)


@router.put("/{evaluation_id}/status", response_model=dict)
def update_research_evaluation_status(
    evaluation_id: int,
    payload: EvaluationStatusUpdatePayload,
    db: DbSession,
):
    return service.update_research_evaluation_status(
        db,
        evaluation_id,
        payload.status or payload.status_value,
    )


@router.put("/{evaluation_id}/tracking", response_model=dict)
def update_research_evaluation_tracking(
    evaluation_id: int,
    payload: EvaluationTrackingUpdatePayload,
    db: DbSession,
):
    data = payload.model_dump(exclude_none=True)
    next_status = data.pop("status", None) or data.pop("status_value", None)
    if next_status is not None:
        data["status"] = next_status

    return service.update_research_evaluation_from_form(
        db,
        evaluation_id,
        data,
        {},
    )


@router.delete("/{evaluation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_research_evaluation(
    evaluation_id: int,
    db: DbSession,
):
    service.delete_research_evaluation(db, evaluation_id)
    return None


