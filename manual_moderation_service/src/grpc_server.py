# stdlib
import asyncio
import logging
from concurrent import futures
from uuid import UUID

# thirdparty
import grpc

# project
from db.db import get_session
from grpc_services.generated import moderator_pb2, moderator_pb2_grpc
from schemas.review import CreateReview
from services.repositories.review import ReviewRepository

logger = logging.getLogger(__name__)


class ModeratorServiceServicer(moderator_pb2_grpc.ModeratorServiceServicer):
    async def CreateReview(
        self, request: moderator_pb2.CreateReviewRequest, context: grpc.aio.ServicerContext
    ) -> moderator_pb2.CreateDeleteReviewResponse:
        user_id = UUID(request.user_id)
        movie_id = UUID(request.movie_id)
        review_id = UUID(request.review_id)
        review_title = request.review_title
        review_text = request.review_text
        auto_moderation_result = request.auto_moderation_result

        async for session in get_session():
            review_repo = ReviewRepository(session)
            try:
                await review_repo.create(
                    obj_in=CreateReview(
                        user_id=user_id,
                        movie_id=movie_id,
                        review_id=review_id,
                        review_title=review_title,
                        review_text=review_text,
                        auto_moderation_result=auto_moderation_result,
                    )
                )
                return moderator_pb2.CreateDeleteReviewResponse(success=True)
            except Exception as er:
                return moderator_pb2.CreateDeleteReviewResponse(success=False, message=str(er))

    async def DeleteReview(
        self, request: moderator_pb2.DeleteReviewRequest, context: grpc.aio.ServicerContext
    ) -> moderator_pb2.CreateDeleteReviewResponse:
        review_id = UUID(request.review_id)

        async for session in get_session():
            review_repo = ReviewRepository(session)
            try:
                db_review = await review_repo.get_by_field("review_id", review_id)
                if db_review is not None:
                    await review_repo.delete(id=db_review.id)
                return moderator_pb2.CreateDeleteReviewResponse(success=True)
            except Exception as er:
                return moderator_pb2.CreateDeleteReviewResponse(success=False, message=str(er))


async def serve() -> None:
    server = grpc.aio.server(futures.ThreadPoolExecutor(max_workers=10))
    moderator_pb2_grpc.add_ModeratorServiceServicer_to_server(ModeratorServiceServicer(), server)
    server.add_insecure_port("[::]:50051")
    await server.start()
    logger.info("gRPC server running on port 50051...")
    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())
