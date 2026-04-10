from datetime import date, datetime

from pydantic import BaseModel


class PresentationBase(BaseModel):
    paper_id: int
    venue: str | None = None
    conference_name: str | None = None
    presentation_date: date | None = None


class PresentationCreate(PresentationBase):
    pass


class PresentationUpdate(BaseModel):
    paper_id: int | None = None
    venue: str | None = None
    conference_name: str | None = None
    presentation_date: date | None = None


class PresentationResponse(PresentationBase):
    id: int
    created_at: datetime
