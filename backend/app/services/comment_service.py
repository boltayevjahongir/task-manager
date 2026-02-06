from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.task import Task
from app.models.comment import Comment
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse
from app.schemas.user import UserBrief
from app.utils.enums import UserRole


def _comment_to_response(comment: Comment) -> CommentResponse:
    return CommentResponse(
        id=comment.id,
        text=comment.text,
        author=UserBrief.model_validate(comment.author),
        created_at=comment.created_at,
    )


async def get_comments(db: AsyncSession, task_id: UUID) -> list[CommentResponse]:
    # Verify task exists
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Task topilmadi")

    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.author))
        .where(Comment.task_id == task_id)
        .order_by(Comment.created_at.asc())
    )
    comments = result.scalars().all()
    return [_comment_to_response(c) for c in comments]


async def create_comment(
    db: AsyncSession, task_id: UUID, data: CommentCreate, current_user: User,
) -> CommentResponse:
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(404, "Task topilmadi")

    comment = Comment(
        text=data.text,
        task_id=task_id,
        author_id=current_user.id,
    )
    db.add(comment)
    await db.commit()

    # Reload with author
    result = await db.execute(
        select(Comment).options(selectinload(Comment.author)).where(Comment.id == comment.id)
    )
    comment = result.scalar_one()
    return _comment_to_response(comment)


async def delete_comment(db: AsyncSession, comment_id: UUID, current_user: User):
    comment = await db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(404, "Komment topilmadi")

    if current_user.role != UserRole.ADMIN and comment.author_id != current_user.id:
        raise HTTPException(403, "Faqat o'z kommentingizni o'chirish mumkin")

    await db.delete(comment)
    await db.commit()
