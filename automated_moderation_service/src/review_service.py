# stdlib
import logging

# project
from config import settings
from grpc_services.grpc_client.moderator_client import ModeratorGRPCClient
from grpc_services.grpc_client.review_client import ReviewGRPCClient

logger = logging.getLogger(__name__)


class ReviewService:
    @staticmethod
    async def update_status(review_id: str, status: str, comment: str) -> None:
        await ReviewGRPCClient(settings.ugc_grpc_server_url).update_review_status(review_id, status, comment)
        logger.info(f'Updating review {review_id} status to {status} with comment "{comment}"')

    @staticmethod
    async def send_to_manual_moderation(
        review_id: str,
        review_title: str,
        review_text: str,
        user_id: str,
        movie_id: str,
        comment: str,
    ) -> None:
        await ModeratorGRPCClient(settings.moderator_grpc_server_url).create_review(
            review_id=review_id,
            review_title=review_title,
            review_text=review_text,
            user_id=user_id,
            movie_id=movie_id,
            auto_moderation_result=comment,
        )
        logger.info(f'Sending review {review_id} to manual moderation with comment "{comment}"')

    @staticmethod
    async def delete_from_manual_moderation(review_id: str) -> None:
        await ModeratorGRPCClient(settings.moderator_grpc_server_url).delete_review(review_id=review_id)
        logger.info(f"Deleting review {review_id} from manual moderation")
