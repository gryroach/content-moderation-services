# stdlib
from enum import StrEnum
from typing import Annotated
from uuid import UUID

# thirdparty
from beanie.odm.enums import SortDirection
from documents.review import Review as ReviewDocument
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from starlette import status

# project
from api.v1.pagination import PaginationParams
from schemas.auth import JwtToken
from schemas.review import CreateReviewData, StatusUpdate
from services.jwt_token import JWTBearer
from services.repositories.reviews import ReviewRepository
from services.review_service import ReviewService, get_review_service

router = APIRouter()


class ReviewOrderBy(StrEnum):
    title = "title"  # type: ignore
    rating = "rating"
    created_at = "created_at"


class ReviewSortParams(BaseModel):
    order_by: ReviewOrderBy = ReviewOrderBy.title
    direction: SortDirection = SortDirection.ASCENDING


@router.get(
    "/",
    response_model=list[ReviewDocument],
    status_code=status.HTTP_200_OK,
    description="Получение списка рецензий",
    summary="Получение списка рецензий",
)
async def get_reviews(
    review_repo: Annotated[ReviewRepository, Depends()],
    pagination_params: Annotated[PaginationParams, Depends()],
    sort_params: Annotated[ReviewSortParams, Depends()],
    token_payload: Annotated[JwtToken, Depends(JWTBearer(auto_error=False))],
    movie_id: Annotated[UUID | None, Query(description="Фильтр по фильму")] = None,
    user_id: Annotated[UUID | None, Query(description="Фильтр по пользователю")] = None,
    rating__gte: Annotated[
        int | None,
        Query(description="Фильтр по рейтингу рецензии (больше или равно)"),
    ] = None,
    rating__lte: Annotated[
        int | None,
        Query(description="Фильтр по рейтингу рецензии (меньше или равно)"),
    ] = None,
) -> list[ReviewDocument]:
    request_user = None
    if token_payload is not None:
        request_user = token_payload.user

    filters = {
        "movie_id": movie_id,
        "user_id": user_id,
        "rating__gte": rating__gte,
        "rating__lte": rating__lte,
    }
    return await review_repo.list(
        skip=pagination_params.page_number - 1,
        limit=pagination_params.page_size,
        sort_field=sort_params.order_by,
        sort_order=sort_params.direction,
        filters=filters,
        request_user=request_user,
    )


@router.get(
    "/{review_id}",
    response_model=ReviewDocument,
    status_code=status.HTTP_200_OK,
    description="Получение рецензии",
    summary="Получение рецензии",
)
async def get_review(
    review_id: UUID,
    review_repo: Annotated[ReviewRepository, Depends()],
    token_payload: Annotated[JwtToken, Depends(JWTBearer(auto_error=False))],
) -> ReviewDocument:
    request_user = None
    if token_payload is not None:
        request_user = token_payload.user
    return await review_repo.get(document_id=review_id, request_user=request_user)


@router.post(
    "/",
    response_model=ReviewDocument,
    status_code=status.HTTP_201_CREATED,
    description="Создание рецензии",
    summary="Создание рецензии",
)
async def create_review(
    review_data: CreateReviewData,
    token_payload: Annotated[JwtToken, Depends(JWTBearer())],
    review_service: Annotated[ReviewService, Depends(get_review_service)],
) -> ReviewDocument:
    return await review_service.create_review(review_data=review_data, user_id=token_payload.user)


@router.delete(
    "/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Удаление рецензии пользователя",
    summary="Удаление рецензии",
)
async def delete_review(
    review_id: UUID,
    token_payload: Annotated[JwtToken, Depends(JWTBearer())],
    review_service: Annotated[ReviewService, Depends(get_review_service)],
    review_repo: Annotated[ReviewRepository, Depends()],
) -> None:
    review: ReviewDocument = await review_repo.get(document_id=review_id, request_user=token_payload.user)
    if review.user_id != token_payload.user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can delete only your review",
        )

    await review_service.delete_review(review_id=review_id, user_id=token_payload.user)


@router.patch(
    "/{review_id}/status",
    response_model=ReviewDocument,
    status_code=status.HTTP_200_OK,
    description="Изменение статуса рецензии",
    summary="Изменение статуса рецензии",
)
async def change_review_satus(
    review_id: UUID,
    status_update: StatusUpdate,
    token_payload: Annotated[JwtToken, Depends(JWTBearer())],
    review_service: Annotated[ReviewService, Depends(get_review_service)],
) -> ReviewDocument:
    if token_payload.role != "moderator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can't change the review status",
        )

    return await review_service.update_review_status(
        review_id=review_id,
        status_update=status_update,
        moderator_id=token_payload.user,
    )
