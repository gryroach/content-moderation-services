class GigaChatServiceError(Exception):
    """Базовое исключение для ошибок сервиса GigaChat"""

    pass


class InvalidAPIResponseError(GigaChatServiceError):
    """Исключение для невалидных ответов API"""

    pass
