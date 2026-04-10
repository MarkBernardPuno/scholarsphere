from datetime import datetime

from pydantic import BaseModel, Field


class CampusBase(BaseModel):
    campus_name: str = Field(min_length=1, max_length=255)


class CampusCreate(CampusBase):
    pass


class CampusUpdate(BaseModel):
    campus_name: str | None = Field(default=None, min_length=1, max_length=255)


class CampusResponse(CampusBase):
    campus_id: int
    created_at: datetime | None = None


class CollegeBase(BaseModel):
    campus_id: int
    college_name: str = Field(min_length=1, max_length=255)
    is_graduate: bool = False


class CollegeCreate(CollegeBase):
    pass


class CollegeUpdate(BaseModel):
    campus_id: int | None = None
    college_name: str | None = Field(default=None, min_length=1, max_length=255)
    is_graduate: bool | None = None


class CollegeResponse(CollegeBase):
    college_id: int
    created_at: datetime | None = None


class DepartmentBase(BaseModel):
    college_id: int
    department_name: str = Field(min_length=1, max_length=255)


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    college_id: int | None = None
    department_name: str | None = Field(default=None, min_length=1, max_length=255)


class DepartmentResponse(DepartmentBase):
    department_id: int
    created_at: datetime | None = None


class SchoolYearBase(BaseModel):
    year_label: str = Field(min_length=4, max_length=20)


class SchoolYearCreate(SchoolYearBase):
    pass


class SchoolYearUpdate(BaseModel):
    year_label: str | None = Field(default=None, min_length=4, max_length=20)


class SchoolYearResponse(SchoolYearBase):
    school_year_id: int


class SemesterBase(BaseModel):
    name: str = Field(min_length=1, max_length=50)


class SemesterCreate(SemesterBase):
    pass


class SemesterUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=50)


class SemesterResponse(SemesterBase):
    semester_id: int


class ResearchOutputTypeBase(BaseModel):
    output_type_name: str = Field(min_length=1, max_length=100)


class ResearchOutputTypeCreate(ResearchOutputTypeBase):
    pass


class ResearchOutputTypeUpdate(BaseModel):
    output_type_name: str | None = Field(default=None, min_length=1, max_length=100)


class ResearchOutputTypeResponse(ResearchOutputTypeBase):
    output_type_id: int


class ResearchTypeBase(BaseModel):
    research_type_name: str = Field(min_length=1, max_length=100)


class ResearchTypeCreate(ResearchTypeBase):
    pass


class ResearchTypeUpdate(BaseModel):
    research_type_name: str | None = Field(default=None, min_length=1, max_length=100)


class ResearchTypeResponse(ResearchTypeBase):
    research_type_id: int


class RoleBase(BaseModel):
    role_name: str = Field(min_length=1, max_length=100)


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    role_name: str | None = Field(default=None, min_length=1, max_length=100)


class RoleResponse(RoleBase):
    role_id: int
    created_at: datetime | None = None
