# project
from constants import ModerationStatus


class AIModerationService:
    @staticmethod
    async def moderate_text(text: str) -> tuple[ModerationStatus, str]:
        """Возвращает статус модерации и комментарий к оценке"""
        return ModerationStatus.APPROVED, ""
