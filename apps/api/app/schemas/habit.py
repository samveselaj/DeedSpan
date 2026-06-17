import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

# Cadence-based recurrence only. Trigger-based / occasional habits ("after
# finishing a workout", "when stressed") need a different model (event-driven,
# not period-bucketed) and are intentionally out of scope here.
HabitCadence = Literal["daily", "weekly", "monthly"]


class HabitCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    cadence: HabitCadence = "daily"


class HabitTick(BaseModel):
    date: date
    completed: bool = True


class HabitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    cadence: HabitCadence
    created_at: datetime


class HabitWithStreak(HabitOut):
    streak: int
    # True if completed for the cadence's relevant period:
    #   daily   -> completed on `today`
    #   weekly  -> at least one completion in the current ISO week (Mon-Sun)
    #   monthly -> at least one completion in the current calendar month
    completed_this_period: bool


class StreakOut(BaseModel):
    streak: int
