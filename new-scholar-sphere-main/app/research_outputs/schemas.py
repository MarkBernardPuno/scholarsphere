from datetime import date, datetime

from pydantic import BaseModel


class ResearchOutputBase(BaseModel):
    paper_id: int
    doi: str | None = None
    manuscript_link: str | None = None
    journal_publisher: str | None = None
    volume: str | None = None
    issue_number: str | None = None
    page_number: str | None = None
    publication_date: date | None = None
    indexing: str | None = None
    cite_score: float | None = None
    impact_factor: float | None = None
    editorial_board: str | None = None
    journal_website: str | None = None
    apa_format: str | None = None


class ResearchOutputCreate(ResearchOutputBase):
    pass


class ResearchOutputUpdate(BaseModel):
    paper_id: int | None = None
    doi: str | None = None
    manuscript_link: str | None = None
    journal_publisher: str | None = None
    volume: str | None = None
    issue_number: str | None = None
    page_number: str | None = None
    publication_date: date | None = None
    indexing: str | None = None
    cite_score: float | None = None
    impact_factor: float | None = None
    editorial_board: str | None = None
    journal_website: str | None = None
    apa_format: str | None = None


class ResearchOutputResponse(ResearchOutputBase):
    id: int
    created_at: datetime
    updated_at: datetime
