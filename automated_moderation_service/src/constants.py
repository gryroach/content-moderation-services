# stdlib
from enum import StrEnum


class EventType(StrEnum):
    REVIEW_CREATED = "review_created"
    REVIEW_STATUS_UPDATED = "review_status_updated"
    REVIEW_DELETED = "review_deleted"


class ModerationStatus(StrEnum):
    APPROVED = "approved"
    REJECTED = "rejected"
    PENDING = "pending"
