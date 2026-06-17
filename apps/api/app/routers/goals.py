import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_current_user
from app.models.goal import Goal
from app.models.task import Task
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalOut, GoalProgress, GoalUpdate

router = APIRouter()


@router.get("", response_model=list[GoalOut])
async def list_goals(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    stmt = (
        select(Goal)
        .where(Goal.user_id == user.id, Goal.deleted_at.is_(None))
        .order_by(Goal.created_at.desc())
    )
    return (await db.scalars(stmt)).all()


@router.post("", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
async def create_goal(
    payload: GoalCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    goal = Goal(user_id=user.id, **payload.model_dump())
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return goal


async def _get_owned_goal(db: AsyncSession, user: User, goal_id: uuid.UUID) -> Goal:
    goal = await db.scalar(
        select(Goal).where(
            Goal.id == goal_id, Goal.user_id == user.id, Goal.deleted_at.is_(None)
        )
    )
    if not goal:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    return goal


@router.patch("/{goal_id}", response_model=GoalOut)
async def update_goal(
    goal_id: uuid.UUID,
    payload: GoalUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    goal = await _get_owned_goal(db, user, goal_id)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(goal, k, v)
    await db.commit()
    await db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    goal = await _get_owned_goal(db, user, goal_id)
    goal.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{goal_id}/progress", response_model=GoalProgress)
async def goal_progress(
    goal_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await _get_owned_goal(db, user, goal_id)
    total = await db.scalar(
        select(func.count())
        .select_from(Task)
        .where(Task.goal_id == goal_id, Task.deleted_at.is_(None))
    ) or 0
    completed = await db.scalar(
        select(func.count())
        .select_from(Task)
        .where(
            Task.goal_id == goal_id,
            Task.deleted_at.is_(None),
            Task.completed_at.is_not(None),
        )
    ) or 0
    percent = int((completed / total) * 100) if total else 0
    return GoalProgress(total=total, completed=completed, percent=percent)
