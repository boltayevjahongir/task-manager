from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.user import User
from app.schemas.auth import (
    SignupRequest, SignupResponse, LoginRequest, LoginResponse,
    LoginPendingResponse, LoginRejectedResponse, RefreshRequest,
)
from app.schemas.user import UserBrief, UserResponse
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.utils.enums import UserRole, UserStatus
from app.config import settings


async def signup(db: AsyncSession, data: SignupRequest) -> SignupResponse:
    # Check if email exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(400, "Bu email allaqachon ro'yxatdan o'tgan")

    # Check if initial admin
    is_initial_admin = (
        settings.INITIAL_ADMIN_EMAIL
        and data.email.lower() == settings.INITIAL_ADMIN_EMAIL.lower()
    )

    user = User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=UserRole.ADMIN if is_initial_admin else UserRole.DEVELOPER,
        status=UserStatus.APPROVED if is_initial_admin else UserStatus.PENDING,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    if is_initial_admin:
        return SignupResponse(
            message="Admin sifatida ro'yxatdan o'tdingiz! Login qilishingiz mumkin.",
            user=UserBrief.model_validate(user),
        )

    return SignupResponse(user=UserBrief.model_validate(user))


async def login(db: AsyncSession, data: LoginRequest):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Email yoki parol noto'g'ri")

    if user.status == UserStatus.PENDING:
        return LoginPendingResponse()

    if user.status == UserStatus.REJECTED:
        return LoginRejectedResponse()

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


async def refresh_tokens(db: AsyncSession, data: RefreshRequest):
    from jose import JWTError
    try:
        payload = decode_token(data.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Noto'g'ri token turi")
        from uuid import UUID
        user_id = UUID(payload["sub"])
    except (JWTError, ValueError, KeyError):
        raise HTTPException(401, "Refresh token yaroqsiz")

    user = await db.get(User, user_id)
    if not user or user.status != UserStatus.APPROVED:
        raise HTTPException(401, "Foydalanuvchi topilmadi yoki tasdiqlanmagan")

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )
