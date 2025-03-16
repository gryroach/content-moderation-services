# stdlib
import json
import logging
import uuid
from typing import Any

# thirdparty
import backoff
import requests
from requests.exceptions import HTTPError, RequestException

# project
from exceptions import GigaChatServiceError, InvalidAPIResponseError

logger = logging.getLogger(__name__)


class GigaChatRepository:
    """Репозиторий для взаимодействия с GigaChat API."""

    def __init__(self, config: dict[str, Any]) -> None:
        """Инициализирует репозиторий.

        Args:
            config: Конфигурация для работы с API
        """
        self.config = config

    @backoff.on_exception(
        backoff.expo,
        (RequestException, HTTPError),
        max_tries=1,
        jitter=backoff.full_jitter,
        on_backoff=lambda details: logger.warning(
            f"Повторная попытка {details['tries']} из-за ошибки: {details['exception']}"
        ),
    )
    def get_auth_token(self) -> str:
        """Получение bearer-токена для аутентификации.

        Returns:
            Токен для авторизации

        Raises:
            GigaChatServiceError: При ошибке авторизации
        """
        try:
            headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
                "RqUID": str(uuid.uuid4()),
                "Authorization": self.config["credentials"]["auth_header"],
            }

            response = requests.post(
                self.config["auth_url"],
                headers=headers,
                data=f"scope={self.config['credentials']['scope']}",
                verify=self.config["security"]["ssl_verify"],
                timeout=self.config["model_params"]["timeout"],
            )
            response.raise_for_status()
            return response.json()["access_token"]

        except requests.exceptions.RequestException as error:
            logger.error(f"Ошибка аутентификации: {error}")
            raise GigaChatServiceError("Не удалось получить токен авторизации") from error

    @backoff.on_exception(
        backoff.expo,
        (RequestException, HTTPError, InvalidAPIResponseError),
        max_tries=3,
        jitter=backoff.full_jitter,
        on_backoff=lambda details: logger.warning(
            f"Повторная попытка {details['tries']} из-за ошибки: {details['exception']}"
        ),
    )
    def send_moderation_request(self, text: str, system_prompt: str) -> str:
        """Отправка запроса на модерацию.

        Args:
            text: Текст для модерации
            system_prompt: Системный промпт для AI

        Returns:
            Ответ от API в виде строки JSON, которую можно сохранить как auto_moderation_result

        Raises:
            InvalidAPIResponseError: При ошибке в ответе API
            GigaChatServiceError: При ошибке взаимодействия с API
        """
        try:
            token = self.get_auth_token()
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": f"Bearer {token}",
            }
            logger.debug(f"Text: {text}, System prompt: {system_prompt}, Config: {self.config}")
            payload = json.dumps(
                {
                    **self.config["model_params"],
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": text},
                    ],
                }
            )
            response = requests.post(
                self.config["chat_url"],
                headers=headers,
                data=payload,
                verify=self.config["security"]["ssl_verify"],
            )
            response.raise_for_status()
            response_json = response.json()
            logger.debug(f"Ответ от API: {response_json}")
            # Проверяем структуру ответа
            self.validate_api_response(response_json)
            return response_json

        except json.JSONDecodeError as error:
            # Добавляем более подробное логирование при ошибке JSON
            logger.error(f"Ошибка декодирования JSON: {error}. Ответ: {response.text}")
            raise InvalidAPIResponseError("Ответ API не содержит ожидаемого JSON") from error

    def validate_api_response(self, response_json: dict[str, Any]) -> None:
        """Базовая проверка ответа API"""
        if not isinstance(response_json, dict):
            raise InvalidAPIResponseError("Ответ API должен быть словарем")
        if "choices" not in response_json:
            raise InvalidAPIResponseError("Некорректная структура ответа API")
