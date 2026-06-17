"""structured journal fields

Revision ID: 0003_journal_fields
Revises: 0002_goal_plans
Create Date: 2026-06-11

"""
from typing import Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003_journal_fields"
down_revision: Union[str, None] = "0002_goal_plans"
branch_labels = None
depends_on = None

JOURNAL_COLUMNS = (
    "what_i_did_today",
    "what_i_planned_but_did_not_do",
    "why_i_did_not_do_it",
    "what_i_learned",
    "what_confused_me",
    "what_i_should_do_tomorrow",
    "one_thing_to_improve",
    "notes",
)


def upgrade() -> None:
    for column_name in JOURNAL_COLUMNS:
        op.add_column(
            "reflections",
            sa.Column(
                column_name,
                sa.Text(),
                nullable=False,
                server_default=sa.text("''"),
            ),
        )

    op.execute(
        """
        UPDATE reflections
        SET notes = body
        WHERE body <> '' AND notes = ''
        """
    )


def downgrade() -> None:
    for column_name in reversed(JOURNAL_COLUMNS):
        op.drop_column("reflections", column_name)
