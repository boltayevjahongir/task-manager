from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.utils.enums import UserRole, UserStatus


class UserBrief(BaseModel):
    id: UUID
    full_name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    id: UUID
    full_name: str
    email: str
    role: UserRole
    status: UserStatus
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int


class RoleUpdateRequest(BaseModel):
    role: UserRole
