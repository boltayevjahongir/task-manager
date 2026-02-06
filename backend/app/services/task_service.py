import math
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.task import Task
from app.models.comment import Comment
from app.models.user import User
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskStatsResponse,
)
from app.schemas.user import UserBrief
from app.utils.enums import UserRole, TaskStatus, TaskPriority, UserStatus


def _task_to_response(task: Task) -> TaskResponse:
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        assignee=UserBrief.model_validate(task.assignee) if task.assignee else None,
        creator=UserBrief.model_validate(task.creator),
        deadline=task.deadline,
        completed_at=task.completed_at,
        comments_count=len(task.comments) if task.comments else 0,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


async def get_tasks(
    db: AsyncSession,
    current_user: User,
    status: TaskStatus | None = None,
    priority: TaskPriority | None = None,
    assigned_to: UUID | None = None,
    search: str | None = None,
    sort_by: str = "created_at",
    order: str = "desc",
    page: int = 1,
    per_page: int = 20,
) -> TaskListResponse:
    query = select(Task).options(
        selectinload(Task.assignee),
        selectinload(Task.creator),
        selectinload(Task.comments),
    )

    # Developer sees only their assigned tasks
    if current_user.role == UserRole.DEVELOPER:
        query = query.where(Task.assigned_to == current_user.id)

    if status:
        query = query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)
    if assigned_to:
        query = query.where(Task.assigned_to == assigned_to)
    if search:
        query = query.where(
            or_(
                Task.title.ilike(f"%{search}%"),
                Task.description.ilike(f"%{search}%"),
            )
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Sorting
    sort_column = getattr(Task, sort_by, Task.created_at)
    if order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    # Pagination
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    tasks = result.scalars().unique().all()

    return TaskListResponse(
        items=[_task_to_response(t) for t in tasks],
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total > 0 else 1,
    )


async def get_task_by_id(db: AsyncSession, task_id: UUID, current_user: User) -> TaskResponse:
    query = select(Task).options(
        selectinload(Task.assignee),
        selectinload(Task.creator),
        selectinload(Task.comments),
    ).where(Task.id == task_id)

    result = await db.execute(query)
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task topilmadi")

    # Developer can only see their own tasks
    if current_user.role == UserRole.DEVELOPER and task.assigned_to != current_user.id:
        raise HTTPException(403, "Bu taskga kirish huquqingiz yo'q")

    return _task_to_response(task)


async def create_task(db: AsyncSession, data: TaskCreate, admin: User) -> TaskResponse:
    task = Task(
        title=data.title,
        description=data.description,
        priority=data.priority,
        assigned_to=data.assigned_to,
        created_by=admin.id,
        deadline=data.deadline,
    )
    db.add(task)
    await db.commit()

    # Reload with relationships
    query = select(Task).options(
        selectinload(Task.assignee),
        selectinload(Task.creator),
        selectinload(Task.comments),
    ).where(Task.id == task.id)
    result = await db.execute(query)
    task = result.scalar_one()

    return _task_to_response(task)


async def update_task(db: AsyncSession, task_id: UUID, data: TaskUpdate) -> TaskResponse:
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Task topilmadi")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    db.add(task)
    await db.commit()

    query = select(Task).options(
        selectinload(Task.assignee),
        selectinload(Task.creator),
        selectinload(Task.comments),
    ).where(Task.id == task.id)
    result = await db.execute(query)
    task = result.scalar_one()

    return _task_to_response(task)


DEVELOPER_TRANSITIONS = {
    TaskStatus.NEW: [TaskStatus.IN_PROGRESS],
    TaskStatus.IN_PROGRESS: [TaskStatus.REVIEW],
    TaskStatus.REVIEW: [TaskStatus.IN_PROGRESS],
    TaskStatus.DONE: [],
}


async def update_task_status(
    db: AsyncSession,
    task_id: UUID,
    new_status: TaskStatus,
    current_user: User,
) -> TaskResponse:
    query = select(Task).options(
        selectinload(Task.assignee),
        selectinload(Task.creator),
        selectinload(Task.comments),
    ).where(Task.id == task_id)

    result = await db.execute(query)
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task topilmadi")

    if current_user.role == UserRole.ADMIN:
        pass
    elif current_user.role == UserRole.DEVELOPER:
        if task.assigned_to != current_user.id:
            raise HTTPException(403, "Bu task sizga biriktirilmagan")
        allowed = DEVELOPER_TRANSITIONS.get(task.status, [])
        if new_status not in allowed:
            raise HTTPException(
                400,
                f"'{task.status.value}' dan '{new_status.value}' ga o'tish mumkin emas",
            )

    task.status = new_status
    if new_status == TaskStatus.DONE:
        task.completed_at = datetime.now(timezone.utc)
    elif task.completed_at and new_status != TaskStatus.DONE:
        task.completed_at = None

    db.add(task)
    await db.commit()
    await db.refresh(task)

    # Reload relationships
    query = select(Task).options(
        selectinload(Task.assignee),
        selectinload(Task.creator),
        selectinload(Task.comments),
    ).where(Task.id == task.id)
    result = await db.execute(query)
    task = result.scalar_one()

    return _task_to_response(task)


async def delete_task(db: AsyncSession, task_id: UUID):
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Task topilmadi")
    await db.delete(task)
    await db.commit()


async def get_stats(db: AsyncSession) -> TaskStatsResponse:
    # Total
    total_result = await db.execute(select(func.count(Task.id)))
    total = total_result.scalar()

    # By status
    status_result = await db.execute(
        select(Task.status, func.count(Task.id)).group_by(Task.status)
    )
    by_status = {row[0].value: row[1] for row in status_result.all()}

    # By priority
    priority_result = await db.execute(
        select(Task.priority, func.count(Task.id)).group_by(Task.priority)
    )
    by_priority = {row[0].value: row[1] for row in priority_result.all()}

    # Overdue
    now = datetime.now(timezone.utc)
    overdue_result = await db.execute(
        select(func.count(Task.id)).where(
            and_(
                Task.deadline < now,
                Task.status != TaskStatus.DONE,
                Task.deadline.isnot(None),
            )
        )
    )
    overdue_count = overdue_result.scalar()

    # By developer
    dev_result = await db.execute(
        select(
            User.id,
            User.full_name,
            func.count(Task.id).label("total"),
            func.count(Task.id).filter(Task.status == TaskStatus.DONE).label("done"),
        )
        .join(Task, Task.assigned_to == User.id)
        .where(User.role == UserRole.DEVELOPER, User.status == UserStatus.APPROVED)
        .group_by(User.id, User.full_name)
    )
    by_developer = [
        {"id": str(row[0]), "name": row[1], "total": row[2], "done": row[3]}
        for row in dev_result.all()
    ]

    return TaskStatsResponse(
        total_tasks=total,
        by_status=by_status,
        by_priority=by_priority,
        overdue_count=overdue_count,
        by_developer=by_developer,
    )


async def get_overdue_tasks(db: AsyncSession) -> list[TaskResponse]:
    now = datetime.now(timezone.utc)
    query = select(Task).options(
        selectinload(Task.assignee),
        selectinload(Task.creator),
        selectinload(Task.comments),
    ).where(
        and_(
            Task.deadline < now,
            Task.status != TaskStatus.DONE,
            Task.deadline.isnot(None),
        )
    ).order_by(Task.deadline.asc())

    result = await db.execute(query)
    tasks = result.scalars().unique().all()
    return [_task_to_response(t) for t in tasks]
