# stdlib
from typing import Any
from uuid import UUID

# thirdparty
from beanie import SortDirection
from documents.review import Review, Status

# project
from schemas.review import CreateReview, UpdateReview
from services.repositories.base import (
    DocumentNotFoundException,
    DocumentType,
    RatingRepository,
)


class ReviewRepository(RatingRepository[Review, CreateReview, UpdateReview]):
    def __init__(self) -> None:
        super().__init__(Review)

    async def list(
        self,
        skip: int = 0,
        limit: int = 10,
        sort_field: str | None = None,
        sort_order: SortDirection = SortDirection.ASCENDING,
        filters: dict[str, Any] | None = None,
        request_user: UUID | None = None,
    ) -> list[DocumentType]:
        query = self._create_query(filters=filters, request_user=request_user)

        sort = []
        if sort_field:
            sort.append((sort_field, sort_order))

        documents = await self.model.find(query, skip=skip, limit=limit).sort(*sort).to_list()
        return documents

    async def get(
        self, document_id: UUID, filters: dict | None = None, request_user: UUID | None = None, get_all: bool = False
    ) -> DocumentType:
        query = self._create_query(filters=filters, request_user=request_user, get_all=get_all)
        query["_id"] = document_id
        document = await self.model.find_one(query)
        if document is None:
            raise DocumentNotFoundException(f"Not found. {self.model.Settings.name}: {document_id}")
        return document

    def _create_query(
        self, filters: dict[str, Any] | None = None, request_user: UUID | None = None, get_all: bool = False
    ) -> dict[str, Any]:
        query = super()._create_query(filters)
        if get_all:
            return query

        status_filter = {"status": Status.APPROVED.value}
        if request_user is not None:
            query["$or"] = [
                status_filter,  # Показываем все с определенным статусом
                {"user_id": request_user},  # Или записи текущего пользователя независимо от статуса
            ]
        else:
            query.update(status_filter)

        return query
