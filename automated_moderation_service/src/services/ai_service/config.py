# stdlib
from typing import Any

# project
from core.config import settings


def get_api_config() -> dict[str, Any]:
    """Возвращает конфигурацию для API GigaChat из настроек приложения.

    Returns:
        Словарь с конфигурацией для API GigaChat

    Raises:
        ValueError: Если настройки GigaChat не были загружены
    """
    if settings.gigachat is None:
        raise ValueError("Настройки GigaChat не были загружены")

    return settings.gigachat.get_config()
