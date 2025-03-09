# stdlib
from typing import List, Literal, Optional

# thirdparty
from pydantic import BaseModel, Field


class ModerationIssue(BaseModel):
    category: str
    description: str
    law: Optional[str] = None


class ModerationResponse(BaseModel):
    status: Literal["approved", "rejected", "pending"]
    tags: List[str]
    issues: List[ModerationIssue]
    confidence: float = Field(ge=0, le=1)


class ChatMessage(BaseModel):
    content: str
    role: str


class ChatChoice(BaseModel):
    message: ChatMessage
    index: int
    finish_reason: str


class ChatResponse(BaseModel):
    choices: list[ChatChoice]
    created: int
    model: str
    object: str
    usage: dict
