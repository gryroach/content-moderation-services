# stdlib
import logging
import re

# thirdparty
from nltk import word_tokenize

# project
from core.config import settings, stemmer_en, stemmer_ru
from core.constants import FAST_MODERATION_FAIL_MESSAGE, ModerationStatus
from services.ai_service import AIModerationService
from services.review_service import ReviewService

logger = logging.getLogger(__name__)


class Moderator:
    """Сервис для модерации отзывов."""

    def __init__(self, review_title: str, review_text: str, review_id: str) -> None:
        """Инициализирует модератор.

        Args:
            review_title: Заголовок отзыва
            review_text: Текст отзыва
            review_id: Идентификатор отзыва
        """
        self.review_title = review_title
        self.review_text = review_text
        self.combined_text = f"{review_title}\n\n{review_text}"
        self.review_id = review_id
        self.banned_stems: set[str] = {stemmer_ru.stem(word) for word in settings.moderation.banned_words} | {
            stemmer_en.stem(word) for word in settings.moderation.banned_words
        }

    async def moderate_review(self) -> None:
        """Модерирует отзыв и обновляет его статус.

        Процесс включает быструю модерацию текста и заголовка совместно,
        а затем, если нужно, модерацию через AI.
        """
        # Выполняем быструю модерацию всего текста (заголовок + содержание)
        if not self.fast_moderate(self.combined_text):
            await ReviewService.update_status(
                review_id=self.review_id,
                status=ModerationStatus.REJECTED,
                comment=FAST_MODERATION_FAIL_MESSAGE,
            )
            return

        # Если быстрая модерация пройдена, проверяем текст через AI
        ai_status, ai_comment = await AIModerationService.moderate_text(self.combined_text)
        if ai_status == ModerationStatus.PENDING:
            # Если AI не уверен, отправляем на ручную модерацию
            await ReviewService.send_to_manual_moderation(
                review_id=self.review_id,
                comment=ai_comment,
            )
        else:
            # Обновляем статус на решение AI (approved или rejected)
            await ReviewService.update_status(
                review_id=self.review_id,
                status=ai_status,
                comment=ai_comment,
            )

    def fast_moderate(self, text: str) -> bool:
        """Выполняет быструю модерацию без вызова AI API.

        Args:
            text: Текст для модерации

        Returns:
            True, если текст прошел быструю модерацию, иначе False
        """
        if len(text) > settings.moderation.max_length:
            return False
        if self.contains_banned_words(text):
            return False
        if settings.moderation.check_links and self.contains_links(text):
            return False
        return True

    def contains_banned_words(self, text: str) -> bool:
        """Проверяет наличие запрещенных слов в тексте.

        Args:
            text: Текст для проверки

        Returns:
            True, если в тексте есть запрещенные слова, иначе False
        """
        words = word_tokenize(text.lower())
        word_stems = {stemmer_ru.stem(word) for word in words} | {stemmer_en.stem(word) for word in words}
        return any(stem in self.banned_stems for stem in word_stems)

    @staticmethod
    def contains_links(text: str) -> bool:
        """Проверяет наличие ссылок в тексте.

        Args:
            text: Текст для проверки

        Returns:
            True, если в тексте есть ссылки, иначе False
        """
        url_pattern = r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+"
        return bool(re.search(url_pattern, text))
