# stdlib
import json
import logging
from typing import Any

# thirdparty
import backoff

# project
from core.constants import MODERATION_SYSTEM_PROMPT
from exceptions import InvalidAPIResponseError
from schemas import ChatResponse, ModerationResponse
from services.ai_service.repository import GigaChatRepository

logger = logging.getLogger(__name__)


class ModerationService:
    """Сервис для взаимодействия с API модерации контента."""

    def __init__(self, repository: GigaChatRepository) -> None:
        """Инициализирует сервис.

        Args:
            repository: Репозиторий для работы с API
        """
        self.repository = repository

    def get_system_prompt(self) -> str:
        """Возвращает системный промт для модерации.

        Returns:
            Текст системного промпта
        """
        return MODERATION_SYSTEM_PROMPT

    @backoff.on_exception(
        backoff.expo,
        InvalidAPIResponseError,
        max_tries=3,
        jitter=backoff.full_jitter,
        on_backoff=lambda details: logger.warning(
            f"Повторная попытка {details['tries']} из-за ошибки валидации: {details['exception']}"
        ),
    )
    def moderate_text(self, text: str) -> ModerationResponse:
        """Модерация текста через GigaChat API с повторными попытками.

        Args:
            text: Текст для модерации

        Returns:
            Результат модерации

        Raises:
            InvalidAPIResponseError: При ошибке обработки ответа от API
        """
        system_prompt = self.get_system_prompt()
        raw_response = self.repository.send_moderation_request(text, system_prompt)
        response = ChatResponse(**raw_response)
        message_content = response.choices[0].message.content.strip("```json\n")  # noqa: B005
        content = json.loads(message_content)
        logger.info(content)
        self._validate_moderation_response(content)
        return ModerationResponse(**content)

    def _validate_moderation_response(self, response: dict[str, Any]) -> None:
        """Полная валидация ответа модерации.

        Args:
            response: Ответ от API для валидации

        Raises:
            InvalidAPIResponseError: Если ответ не соответствует ожидаемому формату
        """
        required_fields = {"status", "tags", "issues", "confidence"}
        if not all(field in response for field in required_fields):
            raise InvalidAPIResponseError("Ответ API не содержит всех обязательных полей")

        if response["status"] not in {"approved", "rejected", "pending"}:
            raise InvalidAPIResponseError("Недопустимое значение статуса в ответе API")

        if not isinstance(response["confidence"], int | float):
            raise InvalidAPIResponseError("Поле confidence должно быть числом")

        if not isinstance(response["issues"], list):
            raise InvalidAPIResponseError("Поле issues должно быть списком")

        if not all(isinstance(issue, dict) for issue in response["issues"]):
            raise InvalidAPIResponseError("Поле issues должно быть списком словарей")

        if not all({"code", "category", "description", "law"}.issubset(issue.keys()) for issue in response["issues"]):
            raise InvalidAPIResponseError("Поле issues должно быть списком словарей")
