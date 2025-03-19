# thirdparty
from pydantic import BaseModel


class ReviewData(BaseModel):
    review_id: str
    title: str
    text: str
    user_id: str
    movie_id: str
