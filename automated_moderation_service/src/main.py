# stdlib
import asyncio
import json

# thirdparty
from aiokafka import AIOKafkaConsumer

# project
from config import settings
from constants import EventType, ModerationStatus
from moderator import Moderator
from review_service import ReviewService


class KafkaReviewConsumer:
    def __init__(self) -> None:
        self.consumer = AIOKafkaConsumer(settings.kafka.topic, bootstrap_servers=settings.kafka.bootstrap_servers)

    @staticmethod
    async def handle_message(message: dict) -> None:
        event_type = message.get("event_type")
        review_id = message.get("review_id")

        if event_type in {EventType.REVIEW_CREATED, EventType.REVIEW_STATUS_UPDATED}:
            title, review_text = message.get("title", ""), message.get("review_text", "")
            moderator_service = Moderator(title, review_text, review_id)
            await moderator_service.moderate_review()
        elif event_type == EventType.REVIEW_DELETED and message.get("status") == ModerationStatus.PENDING:
            await ReviewService.delete_from_manual_moderation(review_id)

    async def consume(self) -> None:
        await self.consumer.start()
        try:
            async for msg in self.consumer:
                message = json.loads(msg.value)
                await self.handle_message(message)
        finally:
            await self.consumer.stop()


if __name__ == "__main__":
    consumer = KafkaReviewConsumer()  # type: ignore
    asyncio.run(consumer.consume())
