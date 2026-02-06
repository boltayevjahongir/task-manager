from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.api.deps import get_current_admin
from app.models.user import User
from app.schemas.user import UserResponse, UserListResponse, RoleUpdateRequest
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=UserListResponse)
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return await user_service.get_all_users(db)


@router.get("/pending", response_model=UserListResponse)
async def get_pending_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return await user_service.get_pending_users(db)


@router.get("/developers", response_model=list[UserResponse])
async def get_developers(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return await user_service.get_approved_developers(db)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return await user_service.get_user_by_id(db, user_id)


@router.patch("/{user_id}/approve", response_model=UserResponse)
async def approve_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return await user_service.approve_user(db, user_id, admin.id)


@router.patch("/{user_id}/reject", response_model=UserResponse)
async def reject_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return await user_service.reject_user(db, user_id)


@router.patch("/{user_id}/role", response_model=UserResponse)
async def change_role(
    user_id: UUID,
    data: RoleUpdateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return await user_service.change_role(db, user_id, data.role)
