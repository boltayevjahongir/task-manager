from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.user import User
from app.schemas.user import UserResponse, UserListResponse
from app.utils.enums import UserRole, UserStatus


async def get_all_users(db: AsyncSession) -> UserListResponse:
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return UserListResponse(
        items=[UserResponse.model_validate(u) for u in users],
        total=len(users),
    )


async def get_pending_users(db: AsyncSession) -> UserListResponse:
    result = await db.execute(
        select(User).where(User.status == UserStatus.PENDING).order_by(User.created_at.desc())
    )
    users = result.scalars().all()
    return UserListResponse(
        items=[UserResponse.model_validate(u) for u in users],
        total=len(users),
    )


async def get_approved_developers(db: AsyncSession) -> list[UserResponse]:
    result = await db.execute(
        select(User).where(
            User.status == UserStatus.APPROVED,
            User.role == UserRole.DEVELOPER,
        ).order_by(User.full_name)
    )
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> UserResponse:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")
    return UserResponse.model_validate(user)


async def approve_user(db: AsyncSession, user_id: UUID, admin_id: UUID) -> UserResponse:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")
    if user.status != UserStatus.PENDING:
        raise HTTPException(400, "Faqat kutilayotgan foydalanuvchilarni tasdiqlash mumkin")

    user.status = UserStatus.APPROVED
    user.approved_by = admin_id
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


async def reject_user(db: AsyncSession, user_id: UUID) -> UserResponse:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")
    if user.status != UserStatus.PENDING:
        raise HTTPException(400, "Faqat kutilayotgan foydalanuvchilarni rad etish mumkin")

    user.status = UserStatus.REJECTED
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


async def change_role(db: AsyncSession, user_id: UUID, role: UserRole) -> UserResponse:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "Foydalanuvchi topilmadi")

    user.role = role
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)
