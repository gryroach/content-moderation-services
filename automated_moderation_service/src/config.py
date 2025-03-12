# stdlib
import logging

# thirdparty
import nltk
from nltk.stem.snowball import SnowballStemmer
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class KafkaSettings(BaseSettings):
    topic: str = Field(default="ugc_reviews")
    bootstrap_servers: str = Field(default="kafka-0:9092")

    model_config = SettingsConfigDict(env_prefix="KAFKA_")


class ModerationSettings(BaseSettings):
    max_title_length: int = 100
    max_review_length: int = 1000
    banned_words: tuple[str, ...] = Field(default_factory=lambda: ())

    model_config = SettingsConfigDict(env_prefix="MODERATION_")


class LoggingSettings(BaseSettings):
    level: str = Field(default="INFO")
    format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"


class Settings(BaseSettings):
    kafka: KafkaSettings = KafkaSettings()
    moderation: ModerationSettings = ModerationSettings()
    logging: LoggingSettings = LoggingSettings()

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
nltk.download("punkt")
stemmer = SnowballStemmer("russian")
logging.basicConfig(
    level=getattr(logging, settings.logging.level.upper()),
    format=settings.logging.format,
)
