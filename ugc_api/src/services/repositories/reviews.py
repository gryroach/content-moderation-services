# thirdparty
from documents.review import Review

# project
from schemas.review import CreateReview, UpdateReview
from services.repositories.base import RatingRepository


class ReviewRepository(RatingRepository[Review, CreateReview, UpdateReview]):
    def __init__(self) -> None:
        super().__init__(Review)
