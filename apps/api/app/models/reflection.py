import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Reflection(Base):
    __tablename__ = "reflections"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    date: Mapped[date] = mapped_column(Date, primary_key=True)
    body: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    what_i_did_today: Mapped[str] = mapped_column(
        Text, nullable=False, server_default=text("''")
    )
    what_i_planned_but_did_not_do: Mapped[str] = mapped_column(
        Text, nullable=False, server_default=text("''")
    )
    why_i_did_not_do_it: Mapped[str] = mapped_column(
        Text, nullable=False, server_default=text("''")
    )
    what_i_learned: Mapped[str] = mapped_column(
        Text, nullable=False, server_default=text("''")
    )
    what_confused_me: Mapped[str] = mapped_column(
        Text, nullable=False, server_default=text("''")
    )
    what_i_should_do_tomorrow: Mapped[str] = mapped_column(
        Text, nullable=False, server_default=text("''")
    )
    one_thing_to_improve: Mapped[str] = mapped_column(
        Text, nullable=False, server_default=text("''")
    )
    notes: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False, onupdate=text("now()")
    )
