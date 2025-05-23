class CustomException(Exception):
    """Базовый класс для всех кастомных исключений."""

    def __init__(self, message: str) -> None:
        self.message = message

    def __str__(self) -> str:
        return self.message
