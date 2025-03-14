# stdlib
import json
import logging

# project
from core.config import settings
from core.constants import ModerationStatus
from services.ai_service.config import get_api_config
from services.ai_service.repository import GigaChatRepository
from services.ai_service.service import ModerationService

logger = logging.getLogger(__name__)


class AIModerationService:
    """Сервис автоматической модерации контента через AI."""

    @staticmethod
    async def moderate_text(text: str) -> tuple[ModerationStatus, str]:
        """Выполняет модерацию текста через AI сервис.

        Args:
            text: Текст для модерации

        Returns:
            Кортеж из статуса модерации и комментария
        """
        try:
            api_config = get_api_config()
            repository = GigaChatRepository(api_config)
            service = ModerationService(repository)

            result = service.moderate_text(text)
            auto_moderation_result = json.dumps(
                result.model_dump(),
                ensure_ascii=False,
            )
            status = result.status
            # Проверяем уровень уверенности для определения необходимости ручной модерации
            if result.confidence < settings.moderation.confidence:
                status = ModerationStatus.PENDING

            return status, auto_moderation_result

        except Exception as error:
            logger.error(f"Ошибка при модерации текста: {error}")
            # В случае ошибки отправляем на ручную модерацию
            return ModerationStatus.PENDING, f"Ошибка AI-модерации: {error}"
