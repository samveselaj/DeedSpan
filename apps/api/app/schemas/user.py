import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    role: str
    is_disabled: bool
    created_at: datetime


class AdminUserUpdate(BaseModel):
    is_disabled: bool | None = None
    role: str | None = None
