# stdlib
import logging
from typing import Any

# thirdparty
import nltk
import orjson
from nltk.stem.snowball import SnowballStemmer
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class KafkaSettings(BaseSettings):
    """Настройки для подключения к Kafka."""

    topic: str = Field(default="ugc_reviews")
    bootstrap_servers: str = Field(default="kafka-0:9092")

    model_config = SettingsConfigDict(env_prefix="MODERATION_KAFKA_")


class ModerationSettings(BaseSettings):
    """Настройки для модерации контента."""

    max_length: int = 1000
    banned_words: list[str] = Field(
        default_factory=lambda: ["мат", "оскорбление", "непристойность"],
        json_schema_extra={"decoder": orjson.loads},  # type: ignore
    )
    check_links: bool = Field(default=False)
    confidence: float = Field(default=0.7)

    model_config = SettingsConfigDict(env_prefix="MODERATION_")


class LoggingSettings(BaseSettings):
    """Настройки логирования."""

    level: str = Field(default="DEBUG")
    format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    model_config = SettingsConfigDict(env_prefix="MODERATION_LOGGING_")


class GigaChatSettings(BaseSettings):
    """Настройки для интеграции с GigaChat API."""

    auth_url: str = Field(default="https://ngw.devices.sberbank.ru:9443/api/v2/oauth")
    chat_url: str = Field(default="https://gigachat.devices.sberbank.ru/api/v1/chat/completions")
    auth_header: str = Field(default="Bearer TOKEN")
    scope: str = Field(default="GIGACHAT_API_PERS")
    model: str = Field(default="GigaChat")
    temperature: float = Field(default=0.0)
    max_tokens: int = Field(default=4096)
    timeout: float = Field(default=10.0)
    ssl_verify: bool = Field(default=False)

    model_config = SettingsConfigDict(env_prefix="GIGACHAT_")

    def get_config(self) -> dict[str, Any]:
        """Преобразует настройки в формат конфигурации для API."""
        return {
            "auth_url": self.auth_url,
            "chat_url": self.chat_url,
            "credentials": {
                "auth_header": self.auth_header,
                "scope": self.scope,
            },
            "model_params": {
                "model": self.model,
                "temperature": self.temperature,
                "stream": False,
                "update_interval": 0,
                "max_tokens": self.max_tokens,
                "timeout": self.timeout,
            },
            "security": {"ssl_verify": self.ssl_verify},
        }


class Settings(BaseSettings):
    """Общие настройки приложения."""

    kafka: KafkaSettings = KafkaSettings()
    moderation: ModerationSettings = ModerationSettings()  # type: ignore
    logging: LoggingSettings = LoggingSettings()
    gigachat: GigaChatSettings | None = None
    ugc_grpc_server_url: str = Field(default="ugc-grpc-server:50051")
    moderator_grpc_server_url: str = Field(default="moderation-grpc-server:50051")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


# Инициализация настроек приложения
settings = Settings()
try:
    settings.gigachat = GigaChatSettings()
except Exception as e:
    logging.warning(f"Не удалось загрузить настройки GigaChat: {e}")

# Инициализация стеммеров для обработки текста
nltk.download("punkt_tab")
stemmer_ru = SnowballStemmer("russian")
stemmer_en = SnowballStemmer("english")

# Настройка логирования
logging.basicConfig(
    level=getattr(logging, settings.logging.level.upper()),
    format=settings.logging.format,
)
