# stdlib
from uuid import UUID

# thirdparty
from pydantic import BaseModel


class CreateReview(BaseModel):
    movie_id: UUID
    user_id: UUID
    title: str
    review_text: str


class UpdateReview(BaseModel):
    movie_id: UUID
    user_id: UUID
    title: str
    review_text: str


class CreateReviewData(BaseModel):
    movie_id: UUID
    title: str
    review_text: str
