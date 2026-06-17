"""allow multiple goals per period

Revision ID: 0005_multiple_goals_per_period
Revises: 0004_tasks_goal_plans
Create Date: 2026-06-17

"""
from typing import Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005_multiple_goals_per_period"
down_revision: Union[str, None] = "0004_tasks_goal_plans"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_index("ix_goal_plans_unique_period", table_name="goal_plans")
    op.create_index(
        "ix_goal_plans_period",
        "goal_plans",
        ["user_id", "period_type", "period_start", "period_end"],
        postgresql_where=sa.text("deleted_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_index("ix_goal_plans_period", table_name="goal_plans")
    op.create_index(
        "ix_goal_plans_unique_period",
        "goal_plans",
        ["user_id", "period_type", "period_start", "period_end"],
        unique=True,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )
