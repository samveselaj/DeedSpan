import uuid
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import require_admin
from app.models.habit import Habit
from app.models.session import Session as SessionModel
from app.models.task import Task
from app.models.user import User
from app.schemas.admin import AdminMetrics
from app.schemas.user import AdminUserUpdate, UserOut
from app.security import now_utc

router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("/users", response_model=list[UserOut])
async def list_users(
    q: str | None = Query(default=None, max_length=200),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).order_by(User.created_at.desc()).limit(200)
    if q:
        stmt = stmt.where(User.email.ilike(f"%{q.lower()}%"))
    return (await db.scalars(stmt)).all()


@router.patch("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: uuid.UUID,
    payload: AdminUserUpdate,
    db: AsyncSession = Depends(get_db),
):
    target = await db.scalar(select(User).where(User.id == user_id))
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND)

    data = payload.model_dump(exclude_unset=True)
    if "role" in data and data["role"] not in {"user", "admin"}:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid role")

    for k, v in data.items():
        setattr(target, k, v)
    await db.commit()
    await db.refresh(target)
    return target


@router.get("/metrics", response_model=AdminMetrics)
async def metrics(db: AsyncSession = Depends(get_db)):
    cutoff = now_utc() - timedelta(days=7)

    user_count = await db.scalar(select(func.count()).select_from(User)) or 0
    active_7d = await db.scalar(
        select(func.count(func.distinct(SessionModel.user_id))).where(
            SessionModel.last_seen_at >= cutoff
        )
    ) or 0
    tasks_created_7d = await db.scalar(
        select(func.count()).select_from(Task).where(Task.created_at >= cutoff)
    ) or 0
    habits_total = await db.scalar(
        select(func.count()).select_from(Habit).where(Habit.deleted_at.is_(None))
    ) or 0

    return AdminMetrics(
        user_count=user_count,
        active_7d=active_7d,
        tasks_created_7d=tasks_created_7d,
        habits_total=habits_total,
    )
