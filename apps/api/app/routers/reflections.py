from datetime import date as date_t
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_current_user
from app.models.reflection import Reflection
from app.models.user import User
from app.schemas.reflection import ReflectionIn, ReflectionOut

router = APIRouter()

JOURNAL_FIELDS = (
    "what_i_did_today",
    "what_i_planned_but_did_not_do",
    "why_i_did_not_do_it",
    "what_i_learned",
    "what_confused_me",
    "what_i_should_do_tomorrow",
    "one_thing_to_improve",
    "notes",
)


def empty_reflection(day: date_t) -> ReflectionOut:
    return ReflectionOut(
        date=day,
        what_i_did_today="",
        what_i_planned_but_did_not_do="",
        why_i_did_not_do_it="",
        what_i_learned="",
        what_confused_me="",
        what_i_should_do_tomorrow="",
        one_thing_to_improve="",
        notes="",
        updated_at=datetime.now(timezone.utc),
    )


@router.get("/{day}", response_model=ReflectionOut)
async def get_reflection(
    day: date_t,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    row = await db.scalar(
        select(Reflection).where(Reflection.user_id == user.id, Reflection.date == day)
    )
    if row:
        return row
    return empty_reflection(day)


@router.put("/{day}", response_model=ReflectionOut)
async def upsert_reflection(
    day: date_t,
    payload: ReflectionIn,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    values = {field: getattr(payload, field) for field in JOURNAL_FIELDS}
    stmt = (
        pg_insert(Reflection)
        .values(user_id=user.id, date=day, body=payload.notes, **values)
        .on_conflict_do_update(
            index_elements=["user_id", "date"],
            set_={**values, "body": payload.notes, "updated_at": text("now()")},
        )
        .returning(Reflection)
    )
    result = await db.execute(stmt)
    await db.commit()
    return result.scalar_one()
