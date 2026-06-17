import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_current_user
from app.models.goal_plan import GoalPlan
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskOut, TaskUpdate

router = APIRouter()


async def _validate_goal_id(
    db: AsyncSession, user: User, goal_id: uuid.UUID | None
) -> None:
    if goal_id is None:
        return
    goal = await db.scalar(
        select(GoalPlan.id).where(
            GoalPlan.id == goal_id,
            GoalPlan.user_id == user.id,
            GoalPlan.deleted_at.is_(None),
        )
    )
    if goal is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Goal not found")


@router.get("", response_model=list[TaskOut])
async def list_tasks(
    filter: Literal["all", "open", "completed"] = Query("open"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    stmt = select(Task).where(Task.user_id == user.id, Task.deleted_at.is_(None))
    if filter == "open":
        stmt = stmt.where(Task.completed_at.is_(None))
    elif filter == "completed":
        stmt = stmt.where(Task.completed_at.is_not(None))
    stmt = stmt.order_by(Task.completed_at.is_(None).desc(), Task.created_at.desc())
    return (await db.scalars(stmt)).all()


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await _validate_goal_id(db, user, payload.goal_id)
    task = Task(user_id=user.id, **payload.model_dump())
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


async def _get_owned_task(db: AsyncSession, user: User, task_id: uuid.UUID) -> Task:
    task = await db.scalar(
        select(Task).where(
            Task.id == task_id, Task.user_id == user.id, Task.deleted_at.is_(None)
        )
    )
    if not task:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    return task


@router.patch("/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    task = await _get_owned_task(db, user, task_id)
    data = payload.model_dump(exclude_unset=True)
    if "goal_id" in data:
        await _validate_goal_id(db, user, data["goal_id"])
    if "completed" in data:
        completed = data.pop("completed")
        task.completed_at = datetime.now(timezone.utc) if completed else None
    for k, v in data.items():
        setattr(task, k, v)
    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    task = await _get_owned_task(db, user, task_id)
    task.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
