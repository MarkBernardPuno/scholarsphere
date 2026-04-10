from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.lookups_api import service
from app.lookups_api.schemas import (
    CampusCreate,
    CampusResponse,
    CampusUpdate,
    CollegeCreate,
    CollegeResponse,
    CollegeUpdate,
    DepartmentCreate,
    DepartmentResponse,
    DepartmentUpdate,
    SchoolYearCreate,
    SchoolYearResponse,
    SchoolYearUpdate,
    ResearchOutputTypeCreate,
    ResearchOutputTypeResponse,
    ResearchOutputTypeUpdate,
    ResearchTypeCreate,
    ResearchTypeResponse,
    ResearchTypeUpdate,
    RoleCreate,
    RoleResponse,
    RoleUpdate,
    IndexingCreate,
    IndexingResponse,
    IndexingUpdate,
    StatusCreate,
    StatusResponse,
    StatusUpdate,
    StatusRemarkCreate,
    StatusRemarkResponse,
    StatusRemarkUpdate,
    SemesterCreate,
    SemesterResponse,
    SemesterUpdate,
)
from database.database import get_db


router = APIRouter(prefix="/lookups", tags=["Lookups"])

DbSession = Annotated[object, Depends(get_db)]
SkipParam = Annotated[int, Query(ge=0)]
LimitParam = Annotated[int, Query(ge=1, le=100)]
ActiveOnlyParam = Annotated[bool, Query()]
CampusFilterParam = Annotated[int | None, Query(ge=1)]
CollegeFilterParam = Annotated[int | None, Query(ge=1)]
ResourcesParam = Annotated[str, Query()]


@router.get("/dropdowns", response_model=dict[str, list[dict]])
def get_dropdowns(
    db: DbSession,
    resources: ResourcesParam = "campuses",
    campus_id: CampusFilterParam = None,
    college_id: CollegeFilterParam = None,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
    active_only: ActiveOnlyParam = True,
):
    allowed = {
        "campuses",
        "colleges",
        "departments",
        "school_years",
        "school_semesters",
        "research_output_types",
        "research_types",
        "roles",
        "indexing",
        "status",
        "statuses_and_remarks",
    }
    selected = [item.strip().lower() for item in resources.split(",") if item.strip()]

    if not selected:
        raise HTTPException(status_code=400, detail="resources cannot be empty")

    invalid = [item for item in selected if item not in allowed]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid resources: {', '.join(invalid)}",
        )

    data: dict[str, list[dict]] = {}

    if "campuses" in selected:
        campuses = service.list_campuses(db, skip, limit, active_only)
        data["campuses"] = [
            {"id": campus["campus_id"], "name": campus["campus_name"]} for campus in campuses
        ]
    if "colleges" in selected:
        colleges = service.list_colleges(db, campus_id, skip, limit, active_only)
        data["colleges"] = [
            {
                "id": college["college_id"],
                "name": college["college_name"],
                "campus_id": college["campus_id"],
                "is_graduate": college["is_graduate"],
            }
            for college in colleges
        ]
    if "departments" in selected:
        departments = service.list_departments(db, college_id, skip, limit, active_only)
        data["departments"] = [
            {
                "id": department["department_id"],
                "name": department["department_name"],
                "college_id": department["college_id"],
            }
            for department in departments
        ]
    if "school_years" in selected:
        school_years = service.list_school_years(db, skip, limit)
        data["school_years"] = [
            {"id": year["school_year_id"], "label": year["year_label"]} for year in school_years
        ]
    if "school_semesters" in selected:
        semesters = service.list_semesters(db, skip, limit)
        data["school_semesters"] = [
            {"id": semester["semester_id"], "name": semester["name"]} for semester in semesters
        ]
    if "research_output_types" in selected:
        output_types = service.list_research_output_types(db, skip, limit)
        data["research_output_types"] = [
            {"id": item["output_type_id"], "name": item["output_type_name"]}
            for item in output_types
        ]
    if "research_types" in selected:
        research_types = service.list_research_types(db, skip, limit)
        data["research_types"] = [
            {"id": item["research_type_id"], "name": item["research_type_name"]}
            for item in research_types
        ]
    if "roles" in selected:
        roles = service.list_roles(db, skip, limit)
        data["roles"] = [
            {"id": role["role_id"], "name": role["role_name"]}
            for role in roles
        ]
    if "indexing" in selected:
        indexing_rows = service.list_indexing(db, skip, limit)
        data["indexing"] = [
            {"id": row["indexing_id"], "name": row["indexing_name"]}
            for row in indexing_rows
        ]
    if "status" in selected:
        status_rows = service.list_statuses(db, skip, limit)
        status_payload = [
            {"id": row["status_id"], "name": row["status_name"]}
            for row in status_rows
        ]
        data["status"] = status_payload
    if "statuses_and_remarks" in selected:
        remark_rows = service.list_statuses_and_remarks(db, skip, limit)
        remarks_payload = [
            {"id": row["statuses_and_remarks_id"], "name": row["statuses_and_remarks_name"]}
            for row in remark_rows
        ]
        data["statuses_and_remarks"] = remarks_payload

    return data


# ============================================================
# Campuses
# ============================================================


@router.post("/campuses", response_model=CampusResponse, status_code=status.HTTP_201_CREATED)
def create_campus(
    payload: CampusCreate,
    db: DbSession,
):
    return service.create_campus(db, payload)


@router.get("/campuses", response_model=list[CampusResponse])
def list_campuses(
    db: DbSession,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
    active_only: ActiveOnlyParam = True,
):
    return service.list_campuses(db, skip, limit, active_only)


@router.get("/campuses/{campus_id}", response_model=CampusResponse)
def get_campus(
    campus_id: int,
    db: DbSession,
):
    return service.get_campus(db, campus_id)


@router.put("/campuses/{campus_id}", response_model=CampusResponse)
def update_campus(
    campus_id: int,
    payload: CampusUpdate,
    db: DbSession,
):
    return service.update_campus(db, campus_id, payload)


@router.delete("/campuses/{campus_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campus(
    campus_id: int,
    db: DbSession,
):
    service.delete_campus(db, campus_id)
    return None


# ============================================================
# Colleges
# ============================================================


@router.post("/colleges", response_model=CollegeResponse, status_code=status.HTTP_201_CREATED)
def create_college(
    payload: CollegeCreate,
    db: DbSession,
):
    return service.create_college(db, payload)


@router.get("/colleges", response_model=list[CollegeResponse])
def list_colleges(
    db: DbSession,
    campus_id: CampusFilterParam = None,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
    active_only: ActiveOnlyParam = True,
):
    return service.list_colleges(db, campus_id, skip, limit, active_only)


@router.get("/campuses/{campus_id}/colleges", response_model=list[CollegeResponse])
def list_colleges_by_campus(
    db: DbSession,
    campus_id: int,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
    active_only: ActiveOnlyParam = True,
):
    return service.list_colleges(db, campus_id, skip, limit, active_only)


@router.get("/colleges/{college_id}", response_model=CollegeResponse)
def get_college(
    college_id: int,
    db: DbSession,
):
    return service.get_college(db, college_id)


@router.put("/colleges/{college_id}", response_model=CollegeResponse)
def update_college(
    college_id: int,
    payload: CollegeUpdate,
    db: DbSession,
):
    return service.update_college(db, college_id, payload)


@router.delete("/colleges/{college_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_college(
    college_id: int,
    db: DbSession,
):
    service.delete_college(db, college_id)
    return None


# ============================================================
# Departments
# ============================================================


@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    payload: DepartmentCreate,
    db: DbSession,
):
    return service.create_department(db, payload)


@router.get("/departments", response_model=list[DepartmentResponse])
def list_departments(
    db: DbSession,
    college_id: CollegeFilterParam = None,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
    active_only: ActiveOnlyParam = True,
):
    return service.list_departments(db, college_id, skip, limit, active_only)


@router.get("/colleges/{college_id}/departments", response_model=list[DepartmentResponse])
def list_departments_by_college(
    db: DbSession,
    college_id: int,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
    active_only: ActiveOnlyParam = True,
):
    return service.list_departments(db, college_id, skip, limit, active_only)


@router.get("/departments/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    db: DbSession,
):
    return service.get_department(db, department_id)


@router.put("/departments/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    payload: DepartmentUpdate,
    db: DbSession,
):
    return service.update_department(db, department_id, payload)


@router.delete("/departments/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    department_id: int,
    db: DbSession,
):
    service.delete_department(db, department_id)
    return None


# ============================================================
# School Years
# ============================================================


@router.post("/school-years", response_model=SchoolYearResponse, status_code=status.HTTP_201_CREATED)
def create_school_year(
    payload: SchoolYearCreate,
    db: DbSession,
):
    return service.create_school_year(db, payload)


@router.get("/school-years", response_model=list[SchoolYearResponse])
def list_school_years(
    db: DbSession,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return service.list_school_years(db, skip, limit)


@router.get("/school-years/{school_year_id}", response_model=SchoolYearResponse)
def get_school_year(
    school_year_id: int,
    db: DbSession,
):
    return service.get_school_year(db, school_year_id)


@router.put("/school-years/{school_year_id}", response_model=SchoolYearResponse)
def update_school_year(
    school_year_id: int,
    payload: SchoolYearUpdate,
    db: DbSession,
):
    return service.update_school_year(db, school_year_id, payload)


@router.delete("/school-years/{school_year_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_school_year(
    school_year_id: int,
    db: DbSession,
):
    service.delete_school_year(db, school_year_id)
    return None


# ============================================================
# Semesters
# ============================================================


@router.post("/semesters", response_model=SemesterResponse, status_code=status.HTTP_201_CREATED)
def create_semester(
    payload: SemesterCreate,
    db: DbSession,
):
    return service.create_semester(db, payload)


@router.get("/semesters", response_model=list[SemesterResponse])
def list_semesters(
    db: DbSession,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return service.list_semesters(db, skip, limit)


@router.get("/semesters/{semester_id}", response_model=SemesterResponse)
def get_semester(
    semester_id: int,
    db: DbSession,
):
    return service.get_semester(db, semester_id)


@router.put("/semesters/{semester_id}", response_model=SemesterResponse)
def update_semester(
    semester_id: int,
    payload: SemesterUpdate,
    db: DbSession,
):
    return service.update_semester(db, semester_id, payload)


@router.delete("/semesters/{semester_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_semester(
    semester_id: int,
    db: DbSession,
):
    service.delete_semester(db, semester_id)
    return None


# ============================================================
# Research Output Types
# ============================================================


@router.post("/research-output-types", response_model=ResearchOutputTypeResponse, status_code=status.HTTP_201_CREATED)
def create_research_output_type(
    payload: ResearchOutputTypeCreate,
    db: DbSession,
):
    return service.create_research_output_type(db, payload)


@router.get("/research-output-types", response_model=list[ResearchOutputTypeResponse])
def list_research_output_types(
    db: DbSession,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return service.list_research_output_types(db, skip, limit)


@router.get("/research-output-types/{output_type_id}", response_model=ResearchOutputTypeResponse)
def get_research_output_type(
    output_type_id: int,
    db: DbSession,
):
    return service.get_research_output_type(db, output_type_id)


@router.put("/research-output-types/{output_type_id}", response_model=ResearchOutputTypeResponse)
def update_research_output_type(
    output_type_id: int,
    payload: ResearchOutputTypeUpdate,
    db: DbSession,
):
    return service.update_research_output_type(db, output_type_id, payload)


@router.delete("/research-output-types/{output_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_research_output_type(
    output_type_id: int,
    db: DbSession,
):
    service.delete_research_output_type(db, output_type_id)
    return None


# ============================================================
# Research Types
# ============================================================


@router.post("/research-types", response_model=ResearchTypeResponse, status_code=status.HTTP_201_CREATED)
def create_research_type(
    payload: ResearchTypeCreate,
    db: DbSession,
):
    return service.create_research_type(db, payload)


@router.get("/research-types", response_model=list[ResearchTypeResponse])
def list_research_types(
    db: DbSession,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return service.list_research_types(db, skip, limit)


@router.get("/research-types/{research_type_id}", response_model=ResearchTypeResponse)
def get_research_type(
    research_type_id: int,
    db: DbSession,
):
    return service.get_research_type(db, research_type_id)


@router.put("/research-types/{research_type_id}", response_model=ResearchTypeResponse)
def update_research_type(
    research_type_id: int,
    payload: ResearchTypeUpdate,
    db: DbSession,
):
    return service.update_research_type(db, research_type_id, payload)


@router.delete("/research-types/{research_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_research_type(
    research_type_id: int,
    db: DbSession,
):
    service.delete_research_type(db, research_type_id)
    return None


# ============================================================
# Roles
# ============================================================


@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(
    payload: RoleCreate,
    db: DbSession,
):
    return service.create_role(db, payload)


@router.get("/roles", response_model=list[RoleResponse])
def list_roles(
    db: DbSession,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return service.list_roles(db, skip, limit)


@router.get("/roles/{role_id}", response_model=RoleResponse)
def get_role(
    role_id: int,
    db: DbSession,
):
    return service.get_role(db, role_id)


@router.put("/roles/{role_id}", response_model=RoleResponse)
def update_role(
    role_id: int,
    payload: RoleUpdate,
    db: DbSession,
):
    return service.update_role(db, role_id, payload)


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    role_id: int,
    db: DbSession,
):
    service.delete_role(db, role_id)
    return None


# ============================================================
# Indexing
# ============================================================


@router.post("/indexing", response_model=IndexingResponse, status_code=status.HTTP_201_CREATED)
def create_indexing(
    payload: IndexingCreate,
    db: DbSession,
):
    return service.create_indexing(db, payload)


@router.get("/indexing", response_model=list[IndexingResponse])
def list_indexing(
    db: DbSession,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return service.list_indexing(db, skip, limit)


@router.get("/indexing/{indexing_id}", response_model=IndexingResponse)
def get_indexing(
    indexing_id: int,
    db: DbSession,
):
    return service.get_indexing(db, indexing_id)


@router.put("/indexing/{indexing_id}", response_model=IndexingResponse)
def update_indexing(
    indexing_id: int,
    payload: IndexingUpdate,
    db: DbSession,
):
    return service.update_indexing(db, indexing_id, payload)


@router.delete("/indexing/{indexing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_indexing(
    indexing_id: int,
    db: DbSession,
):
    service.delete_indexing(db, indexing_id)
    return None


# ============================================================
# Status
# ============================================================


@router.post("/status", response_model=StatusResponse, status_code=status.HTTP_201_CREATED)
def create_status(
    payload: StatusCreate,
    db: DbSession,
):
    return service.create_status(db, payload)


@router.get("/status", response_model=list[StatusResponse])
def list_statuses(
    db: DbSession,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return service.list_statuses(db, skip, limit)


@router.get("/status/{status_id}", response_model=StatusResponse)
def get_status(
    status_id: int,
    db: DbSession,
):
    return service.get_status(db, status_id)


@router.put("/status/{status_id}", response_model=StatusResponse)
def update_status(
    status_id: int,
    payload: StatusUpdate,
    db: DbSession,
):
    return service.update_status(db, status_id, payload)


@router.delete("/status/{status_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_status(
    status_id: int,
    db: DbSession,
):
    service.delete_status(db, status_id)
    return None


# ============================================================
# Statuses and Remarks
# ============================================================


@router.post("/statuses-and-remarks", response_model=StatusRemarkResponse, status_code=status.HTTP_201_CREATED)
def create_statuses_and_remarks(
    payload: StatusRemarkCreate,
    db: DbSession,
):
    return service.create_statuses_and_remarks(db, payload)


@router.get("/statuses-and-remarks", response_model=list[StatusRemarkResponse])
def list_statuses_and_remarks(
    db: DbSession,
    skip: SkipParam = 0,
    limit: LimitParam = 50,
):
    return service.list_statuses_and_remarks(db, skip, limit)


@router.get("/statuses-and-remarks/{statuses_and_remarks_id}", response_model=StatusRemarkResponse)
def get_statuses_and_remarks(
    statuses_and_remarks_id: int,
    db: DbSession,
):
    return service.get_statuses_and_remarks(db, statuses_and_remarks_id)


@router.put("/statuses-and-remarks/{statuses_and_remarks_id}", response_model=StatusRemarkResponse)
def update_statuses_and_remarks(
    statuses_and_remarks_id: int,
    payload: StatusRemarkUpdate,
    db: DbSession,
):
    return service.update_statuses_and_remarks(db, statuses_and_remarks_id, payload)


@router.delete("/statuses-and-remarks/{statuses_and_remarks_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_statuses_and_remarks(
    statuses_and_remarks_id: int,
    db: DbSession,
):
    service.delete_statuses_and_remarks(db, statuses_and_remarks_id)
    return None
