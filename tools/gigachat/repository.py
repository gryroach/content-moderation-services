# stdlib
import json
import logging
import uuid
from typing import Any, Dict

# thirdparty
import backoff
import requests
from errors import GigaChatServiceError, InvalidAPIResponseError
from requests.exceptions import HTTPError, RequestException

logger = logging.getLogger(__name__)


class GigaChatRepository:
    def __init__(self, config: Dict[str, Any]):
        self.config = config

    @backoff.on_exception(
        backoff.expo,
        (RequestException, HTTPError),
        max_tries=3,
        jitter=backoff.full_jitter,
        on_backoff=lambda details: logger.warning(
            f"Повторная попытка {details['tries']} из-за ошибки: {details['exception']}"
        ),
    )
    def get_auth_token(self) -> str:
        """Получение bearer-токена для аутентификации"""
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

        except requests.exceptions.RequestException as e:
            logger.error(f"Ошибка аутентификации: {str(e)}")
            raise GigaChatServiceError("Не удалось получить токен авторизации") from e

    @backoff.on_exception(
        backoff.expo,
        (RequestException, HTTPError, InvalidAPIResponseError),
        max_tries=3,
        jitter=backoff.full_jitter,
        on_backoff=lambda details: logger.warning(
            f"Повторная попытка {details['tries']} из-за ошибки: {details['exception']}"
        ),
    )
    def send_moderation_request(self, text: str, system_prompt: str) -> Dict[str, Any]:
        """Отправка запроса на модерацию"""
        try:
            token = self.get_auth_token()
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": f"Bearer {token}",
            }

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
            logging.debug(response_json)

            self.validate_api_response(response_json)

            return response_json

        except (json.JSONDecodeError, KeyError) as e:
            raise InvalidAPIResponseError("Ошибка при обработке ответа API") from e

    def validate_api_response(self, response_json: Dict[str, Any]) -> None:
        """Базовая проверка ответа API"""
        if not isinstance(response_json, dict):
            raise InvalidAPIResponseError("Ответ API должен быть словарем")
        if "choices" not in response_json:
            raise InvalidAPIResponseError("Некорректная структура ответа API")
