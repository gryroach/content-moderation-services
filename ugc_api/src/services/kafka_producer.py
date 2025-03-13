# stdlib
import json
import random
from contextlib import asynccontextmanager

# thirdparty
from aiokafka.producer import AIOKafkaProducer

# project
from core.config import settings
from schemas.kafka import KafkaMessage


class KafkaProducerService:
    def __init__(self) -> None:
        self.producer = AIOKafkaProducer(
            bootstrap_servers=settings.kafka_bootstrap_server,
            retry_backoff_ms=settings.kafka_retry_backoff_ms,
        )

    @asynccontextmanager
    async def kafka_producer(self) -> AIOKafkaProducer:
        await self.start()
        try:
            yield self.producer
        finally:
            await self.stop()

    async def start(self) -> None:
        await self.producer.start()

    async def stop(self) -> None:
        await self.producer.stop()

    def _encode_value(self, value: str | bytes | dict) -> bytes:
        """Унифицированное преобразование значения в байты."""
        if isinstance(value, dict):
            return json.dumps(value).encode("utf-8")
        if isinstance(value, str):
            return value.encode("utf-8")
        return value

    def _encode_key(self, key: str | bytes | None) -> bytes | None:
        """Унифицированное преобразование ключа в байты."""
        if isinstance(key, str):
            return key.encode("utf-8")
        return key

    async def send_message(self, message: str | bytes | dict, key: str | None) -> None:
        value = self._encode_value(message)
        key_bytes = self._encode_key(key)

        async with self.kafka_producer() as producer:
            await producer.send_and_wait(
                topic=settings.kafka_topic_name,
                value=value,
                key=key_bytes,
            )

    async def send_batch_messages(self, messages: list[KafkaMessage]) -> None:
        async with self.kafka_producer() as producer:
            batch = producer.create_batch()
            for message in messages:
                value = self._encode_value(message.value)
                key_bytes = self._encode_key(message.key) if message.key else None

                batch.append(
                    key=key_bytes,
                    value=value,
                )

            partitions = await producer.partitions_for(settings.kafka_topic_name)
            await producer.send_batch(
                batch=batch,
                topic=settings.kafka_topic_name,
                partition=random.choice(tuple(partitions)),
            )


async def get_kafka_producer_service() -> KafkaProducerService:
    return KafkaProducerService()
