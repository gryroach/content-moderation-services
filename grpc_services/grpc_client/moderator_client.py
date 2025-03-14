# thirdparty
import grpc

# project
from grpc_services.generated import moderator_pb2, moderator_pb2_grpc


class ModeratorGRPCClient:
    def __init__(self, grpc_server_url: str) -> None:
        self.channel = grpc.aio.insecure_channel(grpc_server_url)
        self.stub = moderator_pb2_grpc.ModeratorServiceStub(self.channel)

    async def create_review(
        self,
        user_id: str,
        movie_id: str,
        review_id: str,
        review_title: str,
        review_text: str,
        auto_moderation_result: str,
    ) -> moderator_pb2.CreateDeleteReviewResponse:
        request = moderator_pb2.CreateReviewRequest(
            user_id=user_id,
            movie_id=movie_id,
            review_id=review_id,
            review_title=review_title,
            review_text=review_text,
            auto_moderation_result=auto_moderation_result,
        )
        return await self.stub.CreateReview(request)

    async def delete_review(self, review_id: str) -> moderator_pb2.CreateDeleteReviewResponse:
        request = moderator_pb2.DeleteReviewRequest(review_id=review_id)
        return await self.stub.DeleteReview(request)

    async def close(self) -> None:
        await self.channel.close()
