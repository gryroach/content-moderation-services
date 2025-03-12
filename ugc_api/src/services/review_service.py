# stdlib
from typing import Annotated
from uuid import UUID

# thirdparty
from fastapi import Depends

# project
from documents.review import Review as ReviewDocument
from schemas.review import (
    CreateReview,
    CreateReviewData,
    StatusUpdate,
    UpdateReview,
)
from services.kafka_producer import (
    KafkaProducerService,
    get_kafka_producer_service,
)
from services.repositories.reviews import ReviewRepository


class ReviewService:
    def __init__(
        self,
        review_repo: ReviewRepository,
        kafka_producer: KafkaProducerService,
    ):
        self.review_repo = review_repo
        self.kafka_producer = kafka_producer

    async def create_review(self, review_data: CreateReviewData, user_id: UUID) -> ReviewDocument:
        """Создание рецензии с отправкой события в Kafka."""
        review = await self.review_repo.create(CreateReview(**review_data.model_dump(), user_id=user_id))

        # Отправляем сообщение в Kafka
        await self.kafka_producer.send_message(
            message={
                "event_type": "review_created",
                "review_id": str(review.id),
                "movie_id": str(review.movie_id),
                "user_id": str(review.user_id),
                "title": review.title,
                "review_text": review.review_text,
                "status": review.status,
                "created_at": review.created_at.isoformat(),
            },
            key=str(review.id),
        )

        return review

    async def update_review_status(
        self, review_id: UUID, status_update: StatusUpdate, moderator_id: UUID
    ) -> ReviewDocument:
        """Обновление статуса рецензии с отправкой события в Kafka."""
        review: ReviewDocument = await self.review_repo.get(document_id=review_id, get_all=True)
        review_update_data = UpdateReview(
            movie_id=review.movie_id,
            user_id=review.user_id,
            title=review.title,
            review_text=review.review_text,
            status=status_update.status,
        )
        updated_review = await self.review_repo.update(document=review, update_data=review_update_data)

        # Отправляем сообщение в Kafka
        await self.kafka_producer.send_message(
            message={
                "event_type": "review_status_updated",
                "review_id": str(updated_review.id),
                "movie_id": str(updated_review.movie_id),
                "user_id": str(updated_review.user_id),
                "status": updated_review.status,
                "updated_by": str(moderator_id),
            },
            key=str(updated_review.id),
        )

        return updated_review

    async def delete_review(self, review_id: UUID, user_id: UUID) -> None:
        """Удаление рецензии с отправкой события в Kafka."""
        review: ReviewDocument = await self.review_repo.get(document_id=review_id, request_user=user_id)

        # Отправляем сообщение в Kafka перед удалением
        await self.kafka_producer.send_message(
            message={
                "event_type": "review_deleted",
                "review_id": str(review.id),
                "movie_id": str(review.movie_id),
                "user_id": str(review.user_id),
                "status": str(review.status),
                "deleted_by": str(user_id),
            },
            key=str(review.id),
        )

        await review.delete()


async def get_review_service(
    review_repo: Annotated[ReviewRepository, Depends()],
    kafka_producer: Annotated[KafkaProducerService, Depends(get_kafka_producer_service)],
) -> ReviewService:
    """Фабрика для создания экземпляра ReviewService."""
    return ReviewService(review_repo=review_repo, kafka_producer=kafka_producer)
