# stdlib
from datetime import datetime
from enum import StrEnum
from uuid import UUID

# thirdparty
from pydantic import BaseModel

# project
from models.review import ModerationStatus


class ModerationStatusRequest(StrEnum):
    APPROVED = "approved"
    REJECTED = "rejected"
    PENDING = "pending"


class CreateReview(BaseModel):
    user_id: UUID
    movie_id: UUID
    review_id: UUID
    review_title: str
    review_text: str
    auto_moderation_result: str | None = None
    moderation_status: ModerationStatus = ModerationStatus.PENDING


class UpdateReview(CreateReview):
    moderation_status: ModerationStatus | ModerationStatusRequest
    moderator_id: UUID
    rejection_reason: str | None = None


class ReviewDB(BaseModel):
    id: UUID
    user_id: UUID
    movie_id: UUID
    review_id: UUID
    review_title: str
    review_text: str
    auto_moderation_result: str | None = None
    moderation_status: ModerationStatus
    rejection_reason: str | None = None
    moderator_id: UUID | None = None
    created_at: datetime
    moderation_at: datetime | None = None

    class Config:
        from_attributes = True


class ModerationResponseStatus(BaseModel):
    success: bool
