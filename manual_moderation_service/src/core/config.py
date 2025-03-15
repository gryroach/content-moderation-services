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
# Корень проекта
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"


class AppSettings(BaseSettings):
    project_name: str = Field(default="Manual Moderation API")
    api_production: bool = Field(default=True)
    ugc_grpc_server_url: str = Field(default="ugc-grpc-server:50051")

    # Настройки Postgres
    db_user: str = Field(default="postgres")
    db_password: str = Field(default="pass")
    db_host: str = Field(default="moderator-db")
    db_port: int = Field(default=5432)
    db_name: str = Field(default="moderator_database")
    echo_queries: bool = Field(default=False)

    # Работа с токенами
    jwt_algorithm: str = Field(default="RS256")
    jwt_public_key_path: str = Field(default="/app/keys/example_public_key.pem")

    # Другие настройки
    test_mode: bool = Field(default=False)

    model_config = SettingsConfigDict(
        env_file=DOTENV_PATH,
        env_file_encoding="utf-8",
        extra="ignore",
        env_prefix="MODERATOR_",
    )

    @property
    def database_dsn(self) -> str:
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    @property
    def jwt_public_key(self) -> str:
        try:
            with Path(self.jwt_public_key_path).open() as key_file:
                return key_file.read()
        except FileNotFoundError as err:
            raise ValueError(f"Public key file not found at: {self.jwt_public_key_path}") from err
        except Exception as err:
            raise ValueError(f"Error reading public key: {err!s}") from err


settings = AppSettings()
