# stdlib
from uuid import UUID

# thirdparty
from pydantic import BaseModel


class CreateBookmark(BaseModel):
    movie_id: UUID
    user_id: UUID


class UpdateBookmark(CreateBookmark):
    pass


class BookmarkCreateRequest(BaseModel):
    movie_id: UUID
