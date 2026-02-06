from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.api.deps import get_approved_user, get_current_admin
from app.models.user import User
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskStatusUpdate,
    TaskResponse, TaskListResponse, TaskStatsResponse,
)
from app.services import task_service
from app.utils.enums import TaskStatus, TaskPriority

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/stats", response_model=TaskStatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return await task_service.get_stats(db)


@router.get("/overdue", response_model=list[TaskResponse])
async def get_overdue(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return await task_service.get_overdue_tasks(db)


@router.get("/", response_model=TaskListResponse)
async def get_tasks(
    status: TaskStatus | None = None,
    priority: TaskPriority | None = None,
    assigned_to: UUID | None = None,
    search: str | None = None,
    sort_by: str = "created_at",
    order: str = "desc",
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_approved_user),
):
    return await task_service.get_tasks(
        db, current_user, status=status, priority=priority,
        assigned_to=assigned_to, search=search,
        sort_by=sort_by, order=order, page=page, per_page=per_page,
    )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_approved_user),
):
    return await task_service.get_task_by_id(db, task_id, current_user)


@router.post("/", response_model=TaskResponse, status_code=201)
async def create_task(
    data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return await task_service.create_task(db, data, admin)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    data: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return await task_service.update_task(db, task_id, data)


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: UUID,
    data: TaskStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_approved_user),
):
    return await task_service.update_task_status(db, task_id, data.status, current_user)


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    await task_service.delete_task(db, task_id)
