# stdlib
from uuid import UUID

# thirdparty
from pydantic import BaseModel

# project
from documents.review import Status


class CreateReview(BaseModel):
    movie_id: UUID
    user_id: UUID
    title: str
    review_text: str


class UpdateReview(CreateReview):
    status: Status
    moderation_comment: str = ""


class CreateReviewData(BaseModel):
    movie_id: UUID
    title: str
    review_text: str
