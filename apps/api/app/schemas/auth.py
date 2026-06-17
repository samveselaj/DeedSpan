from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserOut


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class MobileAuthOut(BaseModel):
    session_id: str
    expires_at: datetime
    user: UserOut
