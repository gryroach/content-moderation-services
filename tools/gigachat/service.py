# stdlib
import json
import logging

# thirdparty
import backoff
from constants import MODERATION_SYSTEM_PROMPT
from errors import InvalidAPIResponseError
from repository import GigaChatRepository

# project
from schemas import ChatResponse, ModerationResponse

logger = logging.getLogger(__name__)


class ModerationService:
    def __init__(self, repository: GigaChatRepository):
        self.repository = repository

    def get_system_prompt(self) -> str:
        """Возвращает системный промт для модерации"""
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
        """Модерация текста через GigaChat API с повторными попытками"""
        try:
            system_prompt = self.get_system_prompt()
            raw_response = self.repository.send_moderation_request(text, system_prompt)

            response = ChatResponse(**raw_response)
            content = response.choices[0].message.content

            if "```json" not in content:
                raise InvalidAPIResponseError("Ответ API не содержит ожидаемого JSON")

            json_content = content.split("```json")[1].strip("` \n")
            result_json = json.loads(json_content)

            self._validate_moderation_response(result_json)

            return ModerationResponse(**result_json)
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            raise InvalidAPIResponseError("Ошибка при обработке ответа модерации") from e

    def _validate_moderation_response(self, response: dict) -> None:
        """Полная валидация ответа модерации"""
        required_fields = {"status", "tags", "issues", "confidence"}
        if not all(field in response for field in required_fields):
            raise InvalidAPIResponseError("Ответ API не содержит всех обязательных полей")

        if response["status"] not in {"approved", "rejected", "pending"}:
            raise InvalidAPIResponseError("Недопустимое значение статуса в ответе API")

        if not isinstance(response["confidence"], (int, float)):
            raise InvalidAPIResponseError("Поле confidence должно быть числом")
