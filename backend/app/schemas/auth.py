from pydantic import BaseModel, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError("Kamida 1 ta katta harf bo'lishi kerak")
        if not any(c.isdigit() for c in v):
            raise ValueError("Kamida 1 ta raqam bo'lishi kerak")
        return v


class SignupResponse(BaseModel):
    message: str = "Ro'yxatdan o'tdingiz! Admin tasdiqini kuting."
    user: "UserBrief"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class LoginPendingResponse(BaseModel):
    status: str = "pending"
    message: str = "Admin tasdiqini kuting"


class LoginRejectedResponse(BaseModel):
    status: str = "rejected"
    message: str = "Arizangiz rad etildi"


class RefreshRequest(BaseModel):
    refresh_token: str


from app.schemas.user import UserBrief, UserResponse  # noqa: E402
SignupResponse.model_rebuild()
LoginResponse.model_rebuild()
