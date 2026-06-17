import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_current_user
from app.models.habit import Habit, HabitEntry
from app.models.user import User
from app.schemas.habit import HabitCreate, HabitOut, HabitTick, HabitWithStreak, StreakOut
from app.services.streak_service import (
    compute_monthly_streak,
    compute_streak,
    compute_weekly_streak,
    has_completion_in_current_month,
    has_completion_in_current_week,
)

router = APIRouter()


async def _streak_for(db: AsyncSession, habit: Habit, today: date) -> int:
    if habit.cadence == "weekly":
        return await compute_weekly_streak(db, habit.id, today)
    if habit.cadence == "monthly":
        return await compute_monthly_streak(db, habit.id, today)
    return await compute_streak(db, habit.id, today)


async def _completed_this_period(
    db: AsyncSession, habit: Habit, today: date
) -> bool:
    if habit.cadence == "weekly":
        return await has_completion_in_current_week(db, habit.id, today)
    if habit.cadence == "monthly":
        return await has_completion_in_current_month(db, habit.id, today)
    entry = await db.scalar(
        select(HabitEntry).where(
            HabitEntry.habit_id == habit.id, HabitEntry.date == today
        )
    )
    return bool(entry and entry.completed)


@router.get("", response_model=list[HabitWithStreak])
async def list_habits(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    habits = (
        await db.scalars(
            select(Habit)
            .where(Habit.user_id == user.id, Habit.deleted_at.is_(None))
            .order_by(Habit.created_at.asc())
        )
    ).all()

    today = date.today()
    result: list[HabitWithStreak] = []
    for h in habits:
        result.append(
            HabitWithStreak(
                id=h.id,
                name=h.name,
                cadence=h.cadence,  # type: ignore[arg-type]
                created_at=h.created_at,
                streak=await _streak_for(db, h, today),
                completed_this_period=await _completed_this_period(db, h, today),
            )
        )
    return result


@router.post("", response_model=HabitOut, status_code=status.HTTP_201_CREATED)
async def create_habit(
    payload: HabitCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    habit = Habit(user_id=user.id, name=payload.name, cadence=payload.cadence)
    db.add(habit)
    await db.commit()
    await db.refresh(habit)
    return habit


async def _get_owned_habit(
    db: AsyncSession, user: User, habit_id: uuid.UUID
) -> Habit:
    habit = await db.scalar(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == user.id,
            Habit.deleted_at.is_(None),
        )
    )
    if not habit:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    return habit


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    habit = await _get_owned_habit(db, user, habit_id)
    habit.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{habit_id}/tick", response_model=StreakOut)
async def tick_habit(
    habit_id: uuid.UUID,
    payload: HabitTick,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    habit = await _get_owned_habit(db, user, habit_id)

    # Date-level toggle is the same for both cadences: we mark/unmark the
    # specific date entry. The cadence only changes how status & streak are
    # computed on read.
    if payload.completed:
        stmt = (
            pg_insert(HabitEntry)
            .values(habit_id=habit_id, date=payload.date, completed=True)
            .on_conflict_do_update(
                index_elements=["habit_id", "date"], set_={"completed": True}
            )
        )
        await db.execute(stmt)
    else:
        await db.execute(
            delete(HabitEntry).where(
                HabitEntry.habit_id == habit_id, HabitEntry.date == payload.date
            )
        )
    await db.commit()

    return StreakOut(streak=await _streak_for(db, habit, date.today()))


@router.get("/{habit_id}/streak", response_model=StreakOut)
async def get_streak(
    habit_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    habit = await _get_owned_habit(db, user, habit_id)
    return StreakOut(streak=await _streak_for(db, habit, date.today()))
