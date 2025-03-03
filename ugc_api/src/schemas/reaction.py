# stdlib
from datetime import datetime
from uuid import UUID

# thirdparty
from documents.reaction import ContentType, LikeValue
from pydantic import BaseModel


class Reaction(BaseModel):
    content_type: ContentType = ContentType.movie
    value: LikeValue = LikeValue.like
    user_id: UUID
    target_id: UUID
    created_at: datetime
    updated_at: datetime


class CreateReaction(BaseModel):
    content_type: ContentType = ContentType.movie
    value: LikeValue = LikeValue.like
    user_id: UUID
    target_id: UUID


class UpdateReaction(CreateReaction):
    pass


class ReactionRequest(BaseModel):
    content_type: ContentType
    target_id: UUID
    value: LikeValue | None


class ReactionResponse(BaseModel):
    success: bool = True
