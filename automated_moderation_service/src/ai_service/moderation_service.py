# project
from constants import ModerationStatus


class AIModerationService:
    @staticmethod
    async def moderate_text(text: str) -> tuple[ModerationStatus, str]:
        return ModerationStatus.APPROVED, ""
