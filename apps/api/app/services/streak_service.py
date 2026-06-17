import uuid
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.habit import HabitEntry


def _monday_of(d: date) -> date:
    return d - timedelta(days=d.weekday())


def _month_start(d: date) -> date:
    return d.replace(day=1)


def _prev_month_start(d: date) -> date:
    """Given the first of a month, return the first of the previous month."""
    if d.month == 1:
        return d.replace(year=d.year - 1, month=12)
    return d.replace(month=d.month - 1)


def _month_end(d: date) -> date:
    first = _month_start(d)
    if first.month == 12:
        next_first = first.replace(year=first.year + 1, month=1)
    else:
        next_first = first.replace(month=first.month + 1)
    return next_first - timedelta(days=1)


async def _completed_dates(
    db: AsyncSession, habit_id: uuid.UUID, limit: int = 400
) -> set[date]:
    rows = await db.execute(
        select(HabitEntry.date)
        .where(HabitEntry.habit_id == habit_id, HabitEntry.completed.is_(True))
        .order_by(HabitEntry.date.desc())
        .limit(limit)
    )
    return {row[0] for row in rows.all()}


async def compute_streak(
    db: AsyncSession, habit_id: uuid.UUID, today: date
) -> int:
    """Daily streak: consecutive completed days ending today (or yesterday)."""
    completed = await _completed_dates(db, habit_id)
    if not completed:
        return 0

    cursor = today if today in completed else today - timedelta(days=1)
    streak = 0
    while cursor in completed:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


async def compute_weekly_streak(
    db: AsyncSession, habit_id: uuid.UUID, today: date
) -> int:
    """Weekly streak: consecutive ISO weeks (Mon-Sun) with at least one completion.

    Ends at the current week if completed; otherwise at the previous week if
    that one is completed. Otherwise zero.
    """
    completed = await _completed_dates(db, habit_id)
    if not completed:
        return 0

    completed_weeks = {_monday_of(d) for d in completed}
    this_monday = _monday_of(today)
    cursor = this_monday if this_monday in completed_weeks else this_monday - timedelta(weeks=1)

    streak = 0
    while cursor in completed_weeks:
        streak += 1
        cursor -= timedelta(weeks=1)
    return streak


async def has_completion_in_current_week(
    db: AsyncSession, habit_id: uuid.UUID, today: date
) -> bool:
    monday = _monday_of(today)
    sunday = monday + timedelta(days=6)
    row = await db.scalar(
        select(HabitEntry)
        .where(
            HabitEntry.habit_id == habit_id,
            HabitEntry.date >= monday,
            HabitEntry.date <= sunday,
            HabitEntry.completed.is_(True),
        )
        .limit(1)
    )
    return row is not None


async def compute_monthly_streak(
    db: AsyncSession, habit_id: uuid.UUID, today: date
) -> int:
    """Monthly streak: consecutive calendar months with at least one completion.

    Ends at the current month if completed; otherwise at the previous month if
    that one is completed. Otherwise zero.
    """
    completed = await _completed_dates(db, habit_id)
    if not completed:
        return 0

    completed_months = {_month_start(d) for d in completed}
    this_month = _month_start(today)
    cursor = this_month if this_month in completed_months else _prev_month_start(this_month)

    streak = 0
    while cursor in completed_months:
        streak += 1
        cursor = _prev_month_start(cursor)
    return streak


async def has_completion_in_current_month(
    db: AsyncSession, habit_id: uuid.UUID, today: date
) -> bool:
    first = _month_start(today)
    last = _month_end(today)
    row = await db.scalar(
        select(HabitEntry)
        .where(
            HabitEntry.habit_id == habit_id,
            HabitEntry.date >= first,
            HabitEntry.date <= last,
            HabitEntry.completed.is_(True),
        )
        .limit(1)
    )
    return row is not None
