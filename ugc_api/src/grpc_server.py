# stdlib
import asyncio
import logging
from concurrent import futures
from uuid import UUID

# thirdparty
import grpc

# project
from db.mongodb import init_mongodb
from grpc_services.generated import review_pb2, review_pb2_grpc
from services.repositories.reviews import ReviewRepository
from services.review_service import ReviewService

logger = logging.getLogger(__name__)


class ReviewStatusServicer(review_pb2_grpc.ReviewServiceServicer):
    async def UpdateReviewStatus(
        self, request: review_pb2.UpdateReviewStatusRequest, context: grpc.aio.ServicerContext
    ) -> review_pb2.UpdateReviewStatusResponse:
        review_id = UUID(request.review_id)
        status = request.status
        comment = request.comment

        review_repo = ReviewRepository()
        review_service = ReviewService(review_repo=review_repo)

        try:
            await review_service.update_review_status(review_id, status, comment)
            return review_pb2.UpdateReviewStatusResponse(success=True)
        except Exception as er:
            return review_pb2.UpdateReviewStatusResponse(success=False, message=str(er))


async def serve() -> None:
    client = await init_mongodb()
    server = grpc.aio.server(futures.ThreadPoolExecutor(max_workers=10))
    review_pb2_grpc.add_ReviewServiceServicer_to_server(ReviewStatusServicer(), server)
    server.add_insecure_port("[::]:50051")
    await server.start()
    logger.info("gRPC server running on port 50051...")
    await server.wait_for_termination()
    client.close()


if __name__ == "__main__":
    asyncio.run(serve())
