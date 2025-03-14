# thirdparty
import grpc

# project
from grpc_services.generated import review_pb2, review_pb2_grpc


class ReviewGRPCClient:
    def __init__(self, grpc_server_url: str) -> None:
        self.channel = grpc.aio.insecure_channel(grpc_server_url)
        self.stub = review_pb2_grpc.ReviewServiceStub(self.channel)

    async def update_review_status(
        self,
        review_id: str,
        status: str,
        comment: str,
    ) -> review_pb2.UpdateReviewStatusResponse:
        request = review_pb2.UpdateReviewStatusRequest(review_id=review_id, status=status, comment=comment)
        return await self.stub.UpdateReviewStatus(request)

    async def close(self) -> None:
        await self.channel.close()
