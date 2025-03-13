# stdlib
import logging

# thirdparty
import nltk
import orjson
from nltk.stem.snowball import SnowballStemmer
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class KafkaSettings(BaseSettings):
    topic: str = Field(default="ugc_reviews")
    bootstrap_servers: str = Field(default="kafka-0:9092")

    model_config = SettingsConfigDict(env_prefix="MODERATION_KAFKA_")


class ModerationSettings(BaseSettings):
    max_length: int = 1000
    banned_words: list[str] = Field(json_schema_extra={"decoder": orjson.loads})  # type: ignore
    check_links: bool = Field(default=False)

    model_config = SettingsConfigDict(env_prefix="MODERATION_")


class LoggingSettings(BaseSettings):
    level: str = Field(default="INFO")
    format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    model_config = SettingsConfigDict(env_prefix="MODERATION_LOGGING_")


class Settings(BaseSettings):
    kafka: KafkaSettings = KafkaSettings()
    moderation: ModerationSettings = ModerationSettings()  # type: ignore
    logging: LoggingSettings = LoggingSettings()

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
nltk.download("punkt_tab")
stemmer_ru = SnowballStemmer("russian")
stemmer_en = SnowballStemmer("english")

logging.basicConfig(
    level=getattr(logging, settings.logging.level.upper()),
    format=settings.logging.format,
)
