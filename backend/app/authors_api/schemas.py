from pydantic import BaseModel, Field


class AuthorBase(BaseModel):
    author_name: str = Field(min_length=1, max_length=255)


class AuthorCreate(AuthorBase):
    pass


class AuthorUpdate(BaseModel):
    author_name: str | None = Field(default=None, min_length=1, max_length=255)


class AuthorResponse(AuthorBase):
    author_id: int
