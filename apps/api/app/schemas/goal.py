import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class GoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=4000)
    target_date: date | None = None


class GoalUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=4000)
    target_date: date | None = None
    status: str | None = None


class GoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    target_date: date | None
    status: str
    created_at: datetime


class GoalProgress(BaseModel):
    total: int
    completed: int
    percent: int
