# stdlib
import asyncio
import logging

# thirdparty
import orjson
from aiokafka import AIOKafkaConsumer

# project
from core.config import settings
from core.constants import EventType, ModerationStatus
from services.moderator import Moderator
from services.review_service import ReviewService

logger = logging.getLogger(__name__)


class KafkaReviewConsumer:
    """Консьюмер для получения отзывов из Kafka."""

    def __init__(self) -> None:
        """Инициализирует консьюмер Kafka."""
        self.consumer = None

    async def setup_consumer(self) -> None:
        """Настраивает подключение к Kafka."""
        self.consumer = AIOKafkaConsumer(
            settings.kafka.topic,
            bootstrap_servers=settings.kafka.bootstrap_servers,
        )
        await self.consumer.start()  # type: ignore

    @staticmethod
    async def handle_message(message: dict) -> None:
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
            title, review_text = message.get("title", ""), message.get("review_text", "")
            moderator_service = Moderator(title, review_text, review_id)
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
