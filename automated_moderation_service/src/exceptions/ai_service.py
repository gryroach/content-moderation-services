from .base import ModerationServiceError


class GigaChatServiceError(ModerationServiceError):
    """Исключение для ошибок сервиса GigaChat."""

    pass


class InvalidAPIResponseError(GigaChatServiceError):
    """Исключение для невалидных ответов API."""

    pass
