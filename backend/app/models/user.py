import uuid
from sqlalchemy import Column, String, Enum as SQLEnum, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.utils.enums import UserRole, UserStatus


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole, values_callable=lambda e: [x.value for x in e]), default=UserRole.DEVELOPER, nullable=False)
    status = Column(SQLEnum(UserStatus, values_callable=lambda e: [x.value for x in e]), default=UserStatus.PENDING, nullable=False)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    assigned_tasks = relationship("Task", back_populates="assignee", foreign_keys="Task.assigned_to")
    created_tasks = relationship("Task", back_populates="creator", foreign_keys="Task.created_by")
    comments = relationship("Comment", back_populates="author")
    approver = relationship("User", remote_side=[id], foreign_keys=[approved_by])
