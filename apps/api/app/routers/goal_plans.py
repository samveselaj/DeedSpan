import uuid
from datetime import date, datetime, timezone
from typing import Iterable

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.deps import get_current_user
from app.models.goal_plan import GoalPlan, GoalPlanItem
from app.models.task import Task
from app.models.user import User
from app.schemas.goal_plan import (
    GoalPlanCreate,
    GoalPlanFull,
    GoalPlanItemCreate,
    GoalPlanItemOut,
    GoalPlanItemUpdate,
    GoalPlanUpdate,
    PeriodType,
    PlanProgress,
)
from app.services.plan_periods import compute_bounds, progress_label

# Two routers: one for /goal-plans, one for /goal-plan-items (mounted separately in main.py)
router = APIRouter()
items_router = APIRouter()

FIXED_PERIODS = {"week", "month", "year", "decade"}
MAX_PLANS_PER_PERIOD = 20


# ---------- helpers ----------


async def _get_owned_plan(
    db: AsyncSession, user: User, plan_id: uuid.UUID
) -> GoalPlan:
    plan = await db.scalar(
        select(GoalPlan).where(
            GoalPlan.id == plan_id,
            GoalPlan.user_id == user.id,
            GoalPlan.deleted_at.is_(None),
        )
    )
    if not plan:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    return plan


async def _get_owned_item(
    db: AsyncSession, user: User, item_id: uuid.UUID
) -> GoalPlanItem:
    row = await db.execute(
        select(GoalPlanItem, GoalPlan)
        .join(GoalPlan, GoalPlan.id == GoalPlanItem.plan_id)
        .where(
            GoalPlanItem.id == item_id,
            GoalPlanItem.deleted_at.is_(None),
            GoalPlan.user_id == user.id,
            GoalPlan.deleted_at.is_(None),
        )
    )
    pair = row.first()
    if not pair:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    return pair[0]


async def _items_for_plans(
    db: AsyncSession, plan_ids: Iterable[uuid.UUID]
) -> dict[uuid.UUID, list[GoalPlanItem]]:
    ids = list(plan_ids)
    if not ids:
        return {}
    items = (
        await db.scalars(
            select(GoalPlanItem)
            .where(
                GoalPlanItem.plan_id.in_(ids),
                GoalPlanItem.deleted_at.is_(None),
            )
            .order_by(GoalPlanItem.position, GoalPlanItem.created_at)
        )
    ).all()
    by_plan: dict[uuid.UUID, list[GoalPlanItem]] = {}
    for item in items:
        by_plan.setdefault(item.plan_id, []).append(item)
    return by_plan


def _build_full(
    plan: GoalPlan, items: list[GoalPlanItem], today: date
) -> GoalPlanFull:
    total = len(items)
    completed = sum(1 for i in items if i.completed_at is not None)
    percent = int((completed / total) * 100) if total else 0
    day_index, total_days, label = progress_label(
        plan.period_type, plan.period_start, plan.period_end, today
    )

    # Effective status is computed on read so we don't need a background job
    # to flip "missed" at period boundaries.
    if total > 0 and completed == total:
        effective_status = "completed"
    elif today > plan.period_end and (total == 0 or completed < total):
        effective_status = "missed"
    else:
        effective_status = "active"

    return GoalPlanFull(
        id=plan.id,
        period_type=plan.period_type,  # type: ignore[arg-type]
        title=plan.title,
        period_start=plan.period_start,
        period_end=plan.period_end,
        status=plan.status,  # type: ignore[arg-type]
        created_at=plan.created_at,
        items=[GoalPlanItemOut.model_validate(i) for i in items],
        effective_status=effective_status,  # type: ignore[arg-type]
        progress=PlanProgress(
            total=total,
            completed=completed,
            percent=percent,
            day_index=day_index,
            period_length_days=total_days,
            label=label,
        ),
    )


async def _maybe_persist_status(
    db: AsyncSession, plan: GoalPlan, items: list[GoalPlanItem]
) -> None:
    """Keep stored status in sync with item completion (active <-> completed)."""
    total = len(items)
    completed = sum(1 for i in items if i.completed_at is not None)
    if total > 0 and completed == total:
        next_status = "completed"
    else:
        next_status = "active"
    if plan.status != next_status:
        plan.status = next_status
        await db.commit()


# ---------- plans ----------


@router.get("", response_model=list[GoalPlanFull])
async def list_plans(
    period_type: PeriodType | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    today = date.today()
    stmt = (
        select(GoalPlan)
        .where(GoalPlan.user_id == user.id, GoalPlan.deleted_at.is_(None))
        .order_by(GoalPlan.created_at.desc())
    )

    if period_type in FIXED_PERIODS:
        start, end = compute_bounds(period_type, today)
        stmt = stmt.where(
            GoalPlan.period_type == period_type,
            GoalPlan.period_start == start,
            GoalPlan.period_end == end,
        )
    elif period_type == "custom":
        stmt = stmt.where(GoalPlan.period_type == "custom")

    plans = (await db.scalars(stmt)).all()
    items_by_plan = await _items_for_plans(db, (p.id for p in plans))
    return [_build_full(p, items_by_plan.get(p.id, []), today) for p in plans]


@router.post("", response_model=GoalPlanFull, status_code=status.HTTP_201_CREATED)
async def create_plan(
    payload: GoalPlanCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    today = date.today()
    if payload.period_type in FIXED_PERIODS:
        period_start, period_end = compute_bounds(payload.period_type, today)
    else:
        assert payload.period_start is not None and payload.period_end is not None
        period_start, period_end = payload.period_start, payload.period_end

    count_stmt = select(func.count()).select_from(GoalPlan).where(
        GoalPlan.user_id == user.id,
        GoalPlan.period_type == payload.period_type,
        GoalPlan.deleted_at.is_(None),
    )
    if payload.period_type in FIXED_PERIODS:
        count_stmt = count_stmt.where(
            GoalPlan.period_start == period_start,
            GoalPlan.period_end == period_end,
        )
    current_count = await db.scalar(count_stmt)
    if (current_count or 0) >= MAX_PLANS_PER_PERIOD:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"You can have up to {MAX_PLANS_PER_PERIOD} goals for this timeline",
        )

    plan = GoalPlan(
        user_id=user.id,
        period_type=payload.period_type,
        title=payload.title,
        period_start=period_start,
        period_end=period_end,
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return _build_full(plan, [], today)


@router.get("/{plan_id}", response_model=GoalPlanFull)
async def get_plan(
    plan_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    plan = await _get_owned_plan(db, user, plan_id)
    items_by_plan = await _items_for_plans(db, [plan.id])
    return _build_full(plan, items_by_plan.get(plan.id, []), date.today())


@router.patch("/{plan_id}", response_model=GoalPlanFull)
async def update_plan(
    plan_id: uuid.UUID,
    payload: GoalPlanUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    plan = await _get_owned_plan(db, user, plan_id)
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(plan, k, v)
    await db.commit()
    await db.refresh(plan)
    items_by_plan = await _items_for_plans(db, [plan.id])
    return _build_full(plan, items_by_plan.get(plan.id, []), date.today())


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(
    plan_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    plan = await _get_owned_plan(db, user, plan_id)
    plan.deleted_at = datetime.now(timezone.utc)
    await db.execute(
        update(Task)
        .where(Task.user_id == user.id, Task.goal_id == plan.id)
        .values(goal_id=None)
    )
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---------- plan items ----------


@router.post(
    "/{plan_id}/items",
    response_model=GoalPlanItemOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_item(
    plan_id: uuid.UUID,
    payload: GoalPlanItemCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    plan = await _get_owned_plan(db, user, plan_id)
    next_pos = await db.scalar(
        select(func.coalesce(func.max(GoalPlanItem.position), -1) + 1).where(
            GoalPlanItem.plan_id == plan.id,
            GoalPlanItem.deleted_at.is_(None),
        )
    )
    item = GoalPlanItem(
        plan_id=plan.id,
        title=payload.title,
        notes=payload.notes,
        position=int(next_pos or 0),
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@items_router.patch("/{item_id}", response_model=GoalPlanItemOut)
async def update_item(
    item_id: uuid.UUID,
    payload: GoalPlanItemUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = await _get_owned_item(db, user, item_id)
    data = payload.model_dump(exclude_unset=True)
    if "completed" in data:
        item.completed_at = datetime.now(timezone.utc) if data.pop("completed") else None
    for k, v in data.items():
        setattr(item, k, v)
    await db.commit()
    await db.refresh(item)

    # Keep parent plan's stored status in sync.
    plan = await db.scalar(select(GoalPlan).where(GoalPlan.id == item.plan_id))
    if plan:
        siblings = (
            await db.scalars(
                select(GoalPlanItem).where(
                    GoalPlanItem.plan_id == plan.id,
                    GoalPlanItem.deleted_at.is_(None),
                )
            )
        ).all()
        await _maybe_persist_status(db, plan, list(siblings))
    return item


@items_router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = await _get_owned_item(db, user, item_id)
    item.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
