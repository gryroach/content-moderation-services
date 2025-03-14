# stdlib
import re

# thirdparty
from nltk import word_tokenize

# project
from ai_service.moderation_service import AIModerationService
from config import settings, stemmer_en, stemmer_ru
from constants import ModerationStatus
from review_service import ReviewService

FAST_MODERATION_FAIL_MESSAGE = "Текст не прошел быструю модерацию"


class Moderator:
    def __init__(self, review_title: str, review_text: str, review_id: str, user_id: str, movie_id: str) -> None:
        self.combined_text = f"{review_title}\n\n{review_text}"
        self.review_title = review_title
        self.review_text = review_text
        self.user_id = user_id
        self.movie_id = movie_id
        self.review_id = review_id
        self.banned_stems: set[str] = {stemmer_ru.stem(word) for word in settings.moderation.banned_words} | {
            stemmer_en.stem(word) for word in settings.moderation.banned_words
        }

    async def moderate_review(self) -> None:
        if not self.fast_moderate(self.combined_text):
            await ReviewService.update_status(
                review_id=self.review_id,
                status=ModerationStatus.REJECTED,
                comment=FAST_MODERATION_FAIL_MESSAGE,
            )
            return None

        # Если быстрая модерация пройдена, проверяем текст через AI
        ai_status, ai_comment = await AIModerationService.moderate_text(self.combined_text)
        if ai_status in (
            ModerationStatus.APPROVED,
            ModerationStatus.REJECTED,
        ):
            await ReviewService.update_status(
                review_id=self.review_id,
                status=ai_status,
                comment=ai_comment,
            )
            return None

        await ReviewService.send_to_manual_moderation(
            review_id=self.review_id,
            review_title=self.review_title,
            review_text=self.review_text,
            user_id=self.user_id,
            movie_id=self.movie_id,
            comment=ai_comment,
        )

    async def moderate_text(self, text: str) -> tuple[ModerationStatus, str]:
        if not self.fast_moderate(text):
            return ModerationStatus.REJECTED, FAST_MODERATION_FAIL_MESSAGE

        ai_result, ai_comment = await AIModerationService.moderate_text(text)
        return ai_result, ai_comment

    def fast_moderate(self, text: str) -> bool:
        if len(text) > settings.moderation.max_length:
            return False
        if self.contains_banned_words(text):
            return False
        if settings.moderation.check_links and self.contains_links(text):
            return False
        return True

    def contains_banned_words(self, text: str) -> bool:
        words = word_tokenize(text.lower())
        word_stems = {stemmer_ru.stem(word) for word in words} | {stemmer_en.stem(word) for word in words}
        return any(stem in self.banned_stems for stem in word_stems)

    @staticmethod
    def contains_links(text: str) -> bool:
        url_pattern = r"http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+"
        return bool(re.search(url_pattern, text))
