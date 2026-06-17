"""assign tasks to visible goals

Revision ID: 0004_tasks_goal_plans
Revises: 0003_journal_fields
Create Date: 2026-06-17

"""
from typing import Union

from alembic import op

revision: str = "0004_tasks_goal_plans"
down_revision: Union[str, None] = "0003_journal_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("tasks_goal_id_fkey", "tasks", type_="foreignkey")
    op.execute(
        """
        UPDATE tasks
        SET goal_id = NULL
        WHERE goal_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM goal_plans WHERE goal_plans.id = tasks.goal_id
          )
        """
    )
    op.create_foreign_key(
        "tasks_goal_id_fkey",
        "tasks",
        "goal_plans",
        ["goal_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("tasks_goal_id_fkey", "tasks", type_="foreignkey")
    op.execute(
        """
        UPDATE tasks
        SET goal_id = NULL
        WHERE goal_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM goals WHERE goals.id = tasks.goal_id
          )
        """
    )
    op.create_foreign_key(
        "tasks_goal_id_fkey",
        "tasks",
        "goals",
        ["goal_id"],
        ["id"],
        ondelete="SET NULL",
    )
