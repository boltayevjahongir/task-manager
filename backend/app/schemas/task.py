from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.utils.enums import TaskStatus, TaskPriority
from app.schemas.user import UserBrief


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    priority: TaskPriority = TaskPriority.MEDIUM
    assigned_to: UUID | None = None
    deadline: datetime | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    priority: TaskPriority | None = None
    assigned_to: UUID | None = None
    deadline: datetime | None = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    assignee: UserBrief | None = None
    creator: UserBrief
    deadline: datetime | None
    completed_at: datetime | None
    comments_count: int = 0
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class TaskListResponse(BaseModel):
    items: list[TaskResponse]
    total: int
    page: int
    per_page: int
    pages: int


class TaskStatsResponse(BaseModel):
    total_tasks: int
    by_status: dict[str, int]
    by_priority: dict[str, int]
    overdue_count: int
    by_developer: list[dict]
