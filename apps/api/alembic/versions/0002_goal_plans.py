"""goal plans + items

Revision ID: 0002_goal_plans
Revises: 0001_init
Create Date: 2026-05-22

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002_goal_plans"
down_revision: Union[str, None] = "0001_init"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "goal_plans",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            primary_key=True,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("period_type", sa.String(16), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("period_start", sa.Date(), nullable=False),
        sa.Column("period_end", sa.Date(), nullable=False),
        sa.Column(
            "status", sa.String(16), nullable=False, server_default=sa.text("'active'")
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "period_type IN ('week','month','year','decade','custom')",
            name="goal_plans_period_type_check",
        ),
        sa.CheckConstraint(
            "status IN ('active','completed','missed')",
            name="goal_plans_status_check",
        ),
        sa.CheckConstraint(
            "period_end >= period_start", name="goal_plans_period_order_check"
        ),
    )
    op.create_index("ix_goal_plans_user", "goal_plans", ["user_id"])
    op.create_index(
        "ix_goal_plans_unique_period",
        "goal_plans",
        ["user_id", "period_type", "period_start", "period_end"],
        unique=True,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )

    op.create_table(
        "goal_plan_items",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            primary_key=True,
        ),
        sa.Column(
            "plan_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("goal_plans.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(280), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "position", sa.Integer(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_goal_plan_items_plan_pos", "goal_plan_items", ["plan_id", "position"]
    )


def downgrade() -> None:
    op.drop_index("ix_goal_plan_items_plan_pos", table_name="goal_plan_items")
    op.drop_table("goal_plan_items")
    op.drop_index("ix_goal_plans_unique_period", table_name="goal_plans")
    op.drop_index("ix_goal_plans_user", table_name="goal_plans")
    op.drop_table("goal_plans")
