# stdlib
import uuid
from collections.abc import AsyncGenerator

# thirdparty
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import as_declarative

# project
from core.config import settings


@as_declarative()
class Base:
    """
    Базовый класс для всех ORM-моделей.
    """

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    __name__: str

    @declared_attr
    def __tablename__(cls) -> str:
        """Определяет название таблицы на основе имени класса."""
        return cls.__name__.lower()


engine = create_async_engine(settings.database_dsn, echo=settings.echo_queries, future=True)
async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Возвращает асинхронную сессию базы данных."""
    async with async_session() as session:
        yield session
