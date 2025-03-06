# stdlib
from enum import StrEnum
from typing import ClassVar
from uuid import UUID

# thirdparty
from sqlalchemy import DateTime, Enum as SQLEnum, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

# project
from db.db import Base


class ModerationStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Review(Base):
    user_id: Mapped[UUID] = mapped_column(nullable=False, doc="ID пользователя")
    movie_id: Mapped[UUID] = mapped_column(nullable=False, doc="ID фильма")
    review_id: Mapped[UUID] = mapped_column(nullable=False, doc="ID рецензии")
    review_title: Mapped[str] = mapped_column(Text, nullable=False, doc="Название рецензии")
    review_text: Mapped[str] = mapped_column(Text, nullable=False, doc="Текст рецензии")
    auto_moderation_result: Mapped[str | None] = mapped_column(Text, nullable=True, doc="Результат автомодерации")
    moderation_status: Mapped[ModerationStatus] = mapped_column(
        SQLEnum(ModerationStatus), nullable=False, doc="Статус модерации"
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True, doc="Причина отказа")
    moderator_id: Mapped[UUID | None] = mapped_column(nullable=True, doc="ID модератора")
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, doc="Дата создания"
    )
    moderation_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True, doc="Дата модерации"
    )

    __table_args__: ClassVar[dict] = {"comment": "Reviews"}

    def __repr__(self) -> str:
        return f"<Review(review_id={self.review_id}, moderation_status={self.moderation_status})>"
