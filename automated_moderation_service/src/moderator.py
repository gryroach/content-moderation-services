# stdlib
import re

# thirdparty
from nltk import word_tokenize

# project
from ai_service.moderation_service import AIModerationService
from config import settings, stemmer
from constants import ModerationStatus
from review_service import ReviewService

FAST_MODERATION_FAIL_MESSAGE = "Текст не прошел быструю модерацию"


class Moderator:
    def __init__(self, review_title: str, review_text: str, review_id: str) -> None:
        self.review_title = review_title
        self.review_text = review_text
        self.review_id = review_id
        self.banned_stems = {stemmer.stem(word) for word in settings.banned_words}

    async def moderate_review(self) -> None:
        title_moderation_status, title_moderation_comment = await self.moderate_text(self.review_title)
        if title_moderation_status == ModerationStatus.REJECTED:
            await ReviewService.update_status(
                review_id=self.review_id,
                status=ModerationStatus.REJECTED,
                comment=title_moderation_comment,
            )
            return None
        text_moderation_status, text_moderation_comment = await self.moderate_text(self.review_text)
        if text_moderation_status in (
            ModerationStatus.APPROVED,
            ModerationStatus.REJECTED,
        ):
            await ReviewService.update_status(
                review_id=self.review_id,
                status=ModerationStatus.REJECTED,
                comment=title_moderation_comment,
            )
            return None

        await ReviewService.send_to_manual_moderation(
            review_id=self.review_id,
            comment=title_moderation_comment,
        )

    async def moderate_text(self, text: str) -> tuple[ModerationStatus, str]:
        if not self.fast_moderate(text):
            return ModerationStatus.REJECTED, FAST_MODERATION_FAIL_MESSAGE

        ai_result, ai_comment = await AIModerationService.moderate_text(text)
        return ai_result, ai_comment

    def fast_moderate(self, text: str) -> bool:
        if len(text) > settings.max_title_length:
            return False
        if self.contains_banned_words(text):
            return False
        if settings.check_links and self.contains_links(text):
            return False
        return True

    def contains_banned_words(self, text: str) -> bool:
        words = word_tokenize(text.lower())
        word_stems = {stemmer.stem(word) for word in words}
        return any(stem in self.banned_stems for stem in word_stems)

    @staticmethod
    def contains_links(text: str) -> bool:
        return bool(re.search(r"https?://\S+", text))
