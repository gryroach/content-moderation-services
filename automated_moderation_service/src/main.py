# stdlib
import asyncio

# thirdparty
import orjson
from aiokafka import AIOKafkaConsumer

# project
from config import settings
from constants import EventType, ModerationStatus
from moderator import Moderator
from review_service import ReviewService


class KafkaReviewConsumer:
    def __init__(self) -> None:
        self.consumer: AIOKafkaConsumer | None = None

    async def setup_consumer(self) -> None:
        self.consumer = AIOKafkaConsumer(settings.kafka.topic, bootstrap_servers=settings.kafka.bootstrap_servers)
        await self.consumer.start()

    @staticmethod
    async def handle_message(message: dict) -> None:
        event_type = message.get("event_type")
        review_id = message.get("review_id")

        if event_type in {EventType.REVIEW_CREATED, EventType.REVIEW_STATUS_UPDATED}:
            review_title = message.get("title", "")
            review_text = message.get("review_text", "")
            user_id = message.get("user_id")
            movie_id = message.get("movie_id")

            moderator_service = Moderator(
                review_title=review_title,
                review_text=review_text,
                review_id=review_id,
                user_id=user_id,
                movie_id=movie_id,
            )
            await moderator_service.moderate_review()
        elif event_type == EventType.REVIEW_DELETED and message.get("status") == ModerationStatus.PENDING:
            await ReviewService.delete_from_manual_moderation(review_id)

    async def consume(self) -> None:
        await self.setup_consumer()
        assert self.consumer is not None
        try:
            async for msg in self.consumer:
                message = orjson.loads(msg.value)
                await self.handle_message(message)
        finally:
            await self.consumer.stop()

    async def shutdown(self) -> None:
        if self.consumer is not None:
            await self.consumer.stop()


async def main() -> None:
    consumer = KafkaReviewConsumer()
    try:
        await consumer.consume()
    except KeyboardInterrupt:
        await consumer.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
