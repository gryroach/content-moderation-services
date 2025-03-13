# stdlib
from logging import config as logging_config
from pathlib import Path

# thirdparty
from dotenv import find_dotenv, load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# project
from core.logger import LOGGING

logging_config.dictConfig(LOGGING)
DOTENV_PATH = find_dotenv(".env")
load_dotenv(DOTENV_PATH)


class AppSettings(BaseSettings):
    project_name: str = Field(default="UGC API")
    api_production: bool = Field(default=True)

    # Kafka
    # https://kafka.apache.org/documentation.html#producerconfigs
    kafka_bootstrap_server: str = Field(default="kafka-0:9092")
    kafka_topic_name: str = Field(default="ugc_reviews")
    kafka_batch_sleep: int = Field(default=1, description="Задержка при отправке сообщений пакетами")
    kafka_batch_size: int = Field(default=100, description="Количество сообщений, отправляемых в пакете")
    kafka_retry_backoff_ms: int = Field(default=100)

    # MongoDB
    mongo_db: str = Field(default="Movies")
    mongo_user: str = Field(default="")
    mongo_password: str = Field(default="")
    mongo_host: str = Field(default="mongos1")
    mongo_port: int = Field(default=27017)

    # Sentry
    sentry_dsn: str = Field(default="")

    # Работа с токенами
    jwt_algorithm: str = Field(default="RS256")
    jwt_public_key_path: Path = Field(default=Path("/app/keys/example_public_key.pem"))

    # Другие настройки
    test_mode: bool = Field(default=False)

    model_config = SettingsConfigDict(
        env_file=DOTENV_PATH,
        env_file_encoding="utf-8",
        extra="ignore",
        env_prefix="ugc_",
    )

    @property
    def mongo_dns(self) -> str:
        if not self.mongo_user or not self.mongo_password:
            return f"mongodb://{self.mongo_host}:{self.mongo_port}/{self.mongo_db}"
        return (
            f"mongodb://{self.mongo_user}:{self.mongo_password}@{self.mongo_host}:{self.mongo_port}/"
            f"{self.mongo_db}?authSource=admin"
        )

    @property
    def jwt_public_key(self) -> str:
        try:
            with Path.open(self.jwt_public_key_path) as key_file:
                return key_file.read()
        except FileNotFoundError as err:
            raise ValueError(f"Public key file not found at: {self.jwt_public_key_path}") from err
        except Exception as err:
            raise ValueError(f"Error reading public key: {err}") from err


settings = AppSettings()
