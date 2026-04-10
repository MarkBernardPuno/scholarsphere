from datetime import datetime

from pydantic import BaseModel, Field


class ResearchTypeCreate(BaseModel):
    name: str
    description: str | None = None


class ResearchTypeResponse(ResearchTypeCreate):
    id: int


class ResearchOutputTypeCreate(BaseModel):
    name: str
    description: str | None = None


class ResearchOutputTypeResponse(ResearchOutputTypeCreate):
    id: int


class AuthorCreate(BaseModel):
    user_id: int | None = None
    department_id: int | None = None
    first_name: str
    middle_name: str | None = None
    last_name: str


class AuthorResponse(AuthorCreate):
    id: int
    created_at: datetime


class ResearchAuthorLink(BaseModel):
    author_id: int
    is_primary_author: bool = False
    author_order: int | None = None


class PaperCreate(BaseModel):
    research_type_id: int | None = None
    research_output_type_id: int | None = None
    school_year_id: int | None = None
    semester_id: int | None = None
    title: str
    abstract: str | None = None
    keywords: list[str] = Field(default_factory=list)
    is_active: bool = True
    authors: list[ResearchAuthorLink] = Field(default_factory=list)


class PaperUpdate(BaseModel):
    research_type_id: int | None = None
    research_output_type_id: int | None = None
    school_year_id: int | None = None
    semester_id: int | None = None
    title: str | None = None
    abstract: str | None = None
    keywords: list[str] | None = None
    is_active: bool | None = None
    authors: list[ResearchAuthorLink] | None = None


class PaperResponse(BaseModel):
    id: int
    research_type_id: int | None = None
    research_output_type_id: int | None = None
    school_year_id: int | None = None
    semester_id: int | None = None
    title: str
    abstract: str | None = None
    keywords: list[str] = Field(default_factory=list)
    is_active: bool
    created_at: datetime
    updated_at: datetime
    author_ids: list[int] = Field(default_factory=list)
