from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserBrief


class CommentCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


class CommentResponse(BaseModel):
    id: UUID
    text: str
    author: UserBrief
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
