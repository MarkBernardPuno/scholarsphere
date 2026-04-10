from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    user_id: int
    first_name: str
    middle_initial: str | None = None
    last_name: str
    full_name: str
    email: EmailStr
    campus_id: int | None = None
    college_id: int | None = None
    department_id: int | None = None
    created_at: datetime
