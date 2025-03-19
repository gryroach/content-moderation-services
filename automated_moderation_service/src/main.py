# stdlib
import asyncio
import logging

# thirdparty
import orjson
from aiokafka import AIOKafkaConsumer

# project
from core.config import settings
from core.constants import EventType, ModerationStatus
from schemas.review_data import ReviewData
from services.moderator import Moderator
from services.review_service import ReviewService

logger = logging.getLogger(__name__)


class KafkaReviewConsumer:
    """Консьюмер для получения отзывов из Kafka."""

    def __init__(self) -> None:
        """Инициализирует консьюмер Kafka."""
        self.consumer: AIOKafkaConsumer | None = None

    async def setup_consumer(self) -> None:
        """Настраивает подключение к Kafka."""
        self.consumer = AIOKafkaConsumer(
            settings.kafka.topic,
            bootstrap_servers=settings.kafka.bootstrap_servers,
            group_id="automated_moderation_service",
            auto_offset_reset="earliest",
            enable_auto_commit=False,
        )
        await self.consumer.start()

    @staticmethod
    async def handle_message(message: dict[str, str]) -> None:
        """Обрабатывает сообщение из Kafka.

        Args:
            message: Сообщение из Kafka
        """
        event_type = message.get("event_type")
        review_id = message.get("review_id")

        if event_type in {
            EventType.REVIEW_CREATED,
            EventType.REVIEW_STATUS_UPDATED,
        }:
            review_data = ReviewData(
                review_id=review_id,
                title=message.get("title", ""),
                text=message.get("review_text", ""),
                user_id=message.get("user_id"),
                movie_id=message.get("movie_id"),
            )

            moderator_service = Moderator(review_data)
            await moderator_service.moderate_review()
        elif event_type == EventType.REVIEW_DELETED and message.get("status") == ModerationStatus.PENDING:
            await ReviewService.delete_from_manual_moderation(review_id)

    async def consume(self) -> None:
        """Запускает процесс потребления сообщений из Kafka."""
        await self.setup_consumer()
        assert self.consumer is not None
        try:
            async for msg in self.consumer:
                message = orjson.loads(msg.value)
                await self.handle_message(message)
                await self.consumer.commit()
        finally:
            await self.consumer.stop()

    async def shutdown(self) -> None:
        """Закрывает подключение к Kafka."""
        if self.consumer is not None:
            await self.consumer.stop()


async def main() -> None:
    """Основная функция приложения."""
    logger.info("Запуск сервиса автоматической модерации")
    consumer = KafkaReviewConsumer()
    try:
        await consumer.consume()
    except KeyboardInterrupt:
        logger.info("Получена команда на завершение работы")
        await consumer.shutdown()
    except Exception as error:
        logger.error(f"Критическая ошибка: {error}")
        await consumer.shutdown()
    finally:
        logger.info("Сервис автоматической модерации остановлен")


if __name__ == "__main__":
    asyncio.run(main())
