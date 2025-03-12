# stdlib
import logging

logger = logging.getLogger(__name__)


class ReviewService:
    @staticmethod
    async def update_status(review_id: str, status: str, comment: str) -> None:
        logger.info(f'Updating review {review_id} status to {status} with comment "{comment}"')

    @staticmethod
    async def send_to_manual_moderation(review_id: str, comment: str) -> None:
        logger.info(f'Sending review {review_id} to manual moderation with comment "{comment}"')

    @staticmethod
    async def delete_from_manual_moderation(review_id: str) -> None:
        logger.info(f"Deleting review {review_id} from manual moderation")
