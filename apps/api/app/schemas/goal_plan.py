import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

PeriodType = Literal["week", "month", "year", "decade", "custom"]
PlanStatus = Literal["active", "completed", "missed"]


class GoalPlanCreate(BaseModel):
    period_type: PeriodType
    title: str = Field(min_length=1, max_length=200)
    # required only when period_type == "custom"; ignored otherwise
    period_start: date | None = None
    period_end: date | None = None

    @model_validator(mode="after")
    def _check_custom_dates(self):
        if self.period_type == "custom":
            if not self.period_start or not self.period_end:
                raise ValueError("Custom goals require period_start and period_end")
            if self.period_end < self.period_start:
                raise ValueError("period_end must be on or after period_start")
        return self


class GoalPlanUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)


class GoalPlanItemCreate(BaseModel):
    title: str = Field(min_length=1, max_length=280)
    notes: str | None = Field(default=None, max_length=4000)


class GoalPlanItemUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=280)
    notes: str | None = Field(default=None, max_length=4000)
    completed: bool | None = None
    position: int | None = None


class GoalPlanItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    plan_id: uuid.UUID
    title: str
    notes: str | None
    completed_at: datetime | None
    position: int
    created_at: datetime


class PlanProgress(BaseModel):
    total: int
    completed: int
    percent: int
    day_index: int
    period_length_days: int
    label: str  # "Day 3 of 7", "Year 1 of 10", etc.


class GoalPlanFull(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    period_type: PeriodType
    title: str
    period_start: date
    period_end: date
    status: PlanStatus
    created_at: datetime
    items: list[GoalPlanItemOut]
    effective_status: PlanStatus
    progress: PlanProgress
