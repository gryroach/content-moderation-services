"""
Сервис автоматической модерации отзывов.

Этот модуль предоставляет функциональность для автоматической модерации
отзывов с использованием быстрой проверки и AI-модерации.
"""

# project
from core import settings
from services import AIModerationService, Moderator, ReviewService

__all__ = ["AIModerationService", "Moderator", "ReviewService", "settings"]
