# thirdparty
from fastapi import APIRouter

from .review import router as review_router

api_router = APIRouter()

api_router.include_router(
    review_router,
    prefix="/review",
    tags=["Модерация рецензий"],
)
