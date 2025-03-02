# stdlib
from datetime import datetime
from uuid import UUID, uuid4

# thirdparty
from beanie import Document
from pydantic import Field


class Movie(Document):
    id: UUID = Field(default_factory=uuid4)  # type: ignore
    title: str
    rating: int = 0
    created_at: datetime = Field(default_factory=datetime.now)

    class Settings:
        name = "movies"
