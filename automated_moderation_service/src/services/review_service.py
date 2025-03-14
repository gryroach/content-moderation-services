# stdlib
import logging

# project
from core.config import settings
from core.constants import ModerationStatus
from grpc_services.grpc_client.moderator_client import ModeratorGRPCClient
from grpc_services.grpc_client.review_client import ReviewGRPCClient

logger = logging.getLogger(__name__)


class ReviewService:
    """Сервис для взаимодействия с отзывами."""

    @staticmethod
    async def update_status(review_id: str, status: ModerationStatus, comment: str) -> None:
        """Обновляет статус отзыва.

        Args:
            review_id: Идентификатор отзыва
            status: Новый статус модерации
            comment: Комментарий модератора
        """
        await ReviewGRPCClient(settings.ugc_grpc_server_url).update_review_status(review_id, status, comment)
        logger.info(f'Updating review {review_id} status to {status} with comment "{comment}"')

    @staticmethod
    async def send_to_manual_moderation(
        review_id: str,
        review_title: str,
        review_text: str,
        user_id: str,
        movie_id: str,
        comment: str,
    ) -> None:
        """
        Отправляет отзыв на ручную модерацию.

        Args:
            review_id: Идентификатор отзыва
            review_title: Заголовок отзыва
            review_text: Текст отзыва
            user_id: Идентификатор пользователя, оставившего отзыв
            movie_id: Идентификатор фильма, на который оставлен отзыв
            comment: Комментарий модератора
        """
        await ModeratorGRPCClient(settings.moderator_grpc_server_url).create_review(
            review_id=review_id,
            review_title=review_title,
            review_text=review_text,
            user_id=user_id,
            movie_id=movie_id,
            auto_moderation_result=comment,
        )
        logger.info(f'Sending review {review_id} to manual moderation with comment "{comment}"')

    @staticmethod
    async def delete_from_manual_moderation(review_id: str) -> None:
        """Удаляет отзыв из очереди ручной модерации.

        Args:
            review_id: Идентификатор отзыва
        """
        await ModeratorGRPCClient(settings.moderator_grpc_server_url).delete_review(review_id=review_id)
        logger.info(f"Deleting review {review_id} from manual moderation")
