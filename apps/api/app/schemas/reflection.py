from datetime import date as date_t
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ReflectionFields(BaseModel):
    what_i_did_today: str = Field(default="", max_length=20000)
    what_i_planned_but_did_not_do: str = Field(default="", max_length=20000)
    why_i_did_not_do_it: str = Field(default="", max_length=20000)
    what_i_learned: str = Field(default="", max_length=20000)
    what_confused_me: str = Field(default="", max_length=20000)
    what_i_should_do_tomorrow: str = Field(default="", max_length=20000)
    one_thing_to_improve: str = Field(default="", max_length=20000)
    notes: str = Field(default="", max_length=20000)


class ReflectionIn(ReflectionFields):
    body: str | None = Field(default=None, max_length=20000)

    @model_validator(mode="after")
    def copy_legacy_body_to_notes(self) -> "ReflectionIn":
        if self.body is not None and not self.notes:
            self.notes = self.body
        return self


class ReflectionOut(ReflectionFields):
    model_config = ConfigDict(from_attributes=True)

    date: date_t
    updated_at: datetime
