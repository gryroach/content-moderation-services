# stdlib
import logging

# project
from core.constants import ModerationStatus

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
        logger.info(f'Updating review {review_id} status to {status} with comment "{comment}"')

    @staticmethod
    async def send_to_manual_moderation(review_id: str, comment: str) -> None:
        """Отправляет отзыв на ручную модерацию.

        Args:
            review_id: Идентификатор отзыва
            comment: Комментарий модератора
        """
        logger.info(f'Sending review {review_id} to manual moderation with comment "{comment}"')

    @staticmethod
    async def delete_from_manual_moderation(review_id: str) -> None:
        """Удаляет отзыв из очереди ручной модерации.

        Args:
            review_id: Идентификатор отзыва
        """
        logger.info(f"Deleting review {review_id} from manual moderation")
