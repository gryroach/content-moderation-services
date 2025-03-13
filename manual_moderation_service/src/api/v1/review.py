# stdlib
from typing import Annotated
from uuid import UUID

# thirdparty
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

# project
from db.db import get_session
from schemas.auth import JwtToken
from schemas.pagination import PaginationResult, Paginator
from schemas.review import (
    CreateReview,
    ModerationResponseStatus,
    ModerationStatus,
    ReviewDB,
    UpdateReview,
)
from services.jwt_token import JWTBearer
from services.repositories.review import ReviewRepository

router = APIRouter()


@router.get(
    "/reviews",
    response_model=PaginationResult[ReviewDB],
    description="Список рецензий на модерацию",
    summary="Список рецензий",
    dependencies=[Depends(JWTBearer())],
)
async def get_reviews(
    db: Annotated[AsyncSession, Depends(get_session)],
    paginator: Annotated[Paginator[ReviewDB], Depends()],
) -> PaginationResult[ReviewDB]:
    """Получить список рецензий на модерацию."""
    review_repo = ReviewRepository(db)
    reviews = await review_repo.get_multi(
        skip=paginator.skip,
        limit=paginator.size,
    )
    return paginator.to_response(data=reviews)


@router.get(
    "/{review_id}",
    response_model=ReviewDB,
    description="Получить рецензию на модерацию по id",
    summary="Получить рецензию по id",
    dependencies=[Depends(JWTBearer())],
)
async def get_review_by_id(
    review_id: UUID,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> ReviewDB:
    """Получить рецензию по id."""
    review_repo = ReviewRepository(db)
    db_review = await review_repo.get(review_id)
    if db_review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Рецензия не найдена",
        )
    return ReviewDB.model_validate(db_review)


@router.post(
    "/",
    response_model=ReviewDB,
    status_code=status.HTTP_201_CREATED,
    description="Создать рецензию на модерацию",
    summary="Создать рецензию",
    dependencies=[Depends(JWTBearer())],
)
async def create_review(
    review: CreateReview,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> ReviewDB:
    """Создать рецензию."""
    review_repo = ReviewRepository(db)
    db_review = await review_repo.create(obj_in=review)
    return ReviewDB.model_validate(db_review)


@router.patch(
    "/{review_id}",
    response_model=ModerationResponseStatus,
    description="Провести модерацию рецензии",
    summary="Модерация рецензии",
)
async def moderate_review(
    review_id: UUID,
    moderation_status: ModerationStatus,
    rejection_reason: str,
    db: Annotated[AsyncSession, Depends(get_session)],
    token_payload: Annotated[JwtToken, Depends(JWTBearer())],
) -> ModerationResponseStatus:
    review_repo = ReviewRepository(db)
    db_review = await review_repo.get(review_id)
    if db_review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Рецензия не найдена",
        )
    review = ReviewDB.model_validate(db_review)
    obj_in = UpdateReview(
        **review.model_dump(exclude={"moderation_status", "moderator_id", "rejection_reason"}),
        moderation_status=moderation_status,
        moderator_id=token_payload.user,
        rejection_reason=rejection_reason,
    )
    await review_repo.update(
        db_obj=db_review,
        obj_in=obj_in,
    )
    return ModerationResponseStatus(success=True)
