import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=280)
    goal_id: uuid.UUID | None = None
    priority: int | None = Field(default=None, ge=1, le=3)
    due_date: date | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=280)
    goal_id: uuid.UUID | None = None
    priority: int | None = Field(default=None, ge=1, le=3)
    due_date: date | None = None
    completed: bool | None = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    goal_id: uuid.UUID | None
    priority: int | None
    due_date: date | None
    completed_at: datetime | None
    created_at: datetime
