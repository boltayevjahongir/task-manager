from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.api.deps import get_approved_user
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse
from app.services import comment_service

router = APIRouter(prefix="/tasks/{task_id}/comments", tags=["Comments"])


@router.get("/", response_model=list[CommentResponse])
async def get_comments(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_approved_user),
):
    return await comment_service.get_comments(db, task_id)


@router.post("/", response_model=CommentResponse, status_code=201)
async def create_comment(
    task_id: UUID,
    data: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_approved_user),
):
    return await comment_service.create_comment(db, task_id, data, current_user)


@router.delete("/{comment_id}", status_code=204)
async def delete_comment(
    task_id: UUID,
    comment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_approved_user),
):
    await comment_service.delete_comment(db, comment_id, current_user)
