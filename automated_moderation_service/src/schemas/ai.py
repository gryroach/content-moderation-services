# stdlib
from typing import Literal

# thirdparty
from pydantic import BaseModel, Field


class ModerationIssue(BaseModel):
    """Модель для представления проблемы, найденной в тексте при модерации."""

    category: str
    description: str
    law: str | None = None


class ModerationResponse(BaseModel):
    """Модель для представления результата модерации."""

    status: Literal["approved", "rejected", "pending"]
    tags: str
    issues: list[dict[str, str | int | float]]
    confidence: float | int = Field(ge=0, le=1)


class ChatMessage(BaseModel):
    """Модель для представления сообщения в чате."""

    content: str
    role: str


class ChatChoice(BaseModel):
    """Модель для представления выбора сообщения из AI."""

    message: ChatMessage
    index: int
    finish_reason: str


class ChatResponse(BaseModel):
    """Модель для представления ответа от ChatGPT API."""

    choices: list[ChatChoice]
    created: int
    model: str
    object: str
    usage: dict
