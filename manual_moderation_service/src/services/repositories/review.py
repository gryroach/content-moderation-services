# thirdparty
from sqlalchemy.ext.asyncio import AsyncSession

# project
from models.review import Review
from schemas.review import CreateReview, UpdateReview
from services.repositories.base import BaseCRUDRepository


class ReviewRepository(BaseCRUDRepository[Review, CreateReview, UpdateReview]):
    def __init__(self, session: AsyncSession):
        super().__init__(Review, session)
