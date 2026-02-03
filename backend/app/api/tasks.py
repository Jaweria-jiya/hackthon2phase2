from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel, Field as PydanticField
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from app.database import get_session
from app.models.task import Task
from app.auth.dependencies import get_current_user, verify_user_access


router = APIRouter(prefix="/api", tags=["tasks"])


class TaskCreate(BaseModel):
    """Request model for creating a task."""
    title: str = PydanticField(..., max_length=500, min_length=1)
    description: Optional[str] = None
    scheduled_date: Optional[date] = None


class TaskUpdate(BaseModel):
    """Request model for updating a task."""
    title: Optional[str] = PydanticField(None, max_length=500, min_length=1)
    description: Optional[str] = None
    scheduled_date: Optional[date] = None


class TaskResponse(BaseModel):
    """Response model for task."""
    id: str
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    scheduled_date: Optional[date]
    created_at: datetime
    updated_at: datetime


@router.get("/{user_id}/tasks", response_model=List[TaskResponse])
async def get_tasks(
    user_id: str,
    current_user: str = Depends(get_current_user),
    _: None = Depends(verify_user_access),
    session: AsyncSession = Depends(get_session)
):
    """
    Get all tasks for authenticated user.

    USER ISOLATION ENFORCEMENT (Defense-in-Depth):
    1. get_current_user: Extracts user_id from JWT token (authenticated user)
    2. verify_user_access: Validates URL user_id matches token user_id (middleware layer)
    3. Database query: Filters by current_user (token), NOT user_id (URL) (query layer)

    This triple-layer approach ensures:
    - Even if middleware is bypassed, query still filters by authenticated user
    - Users can ONLY see their own tasks, never other users' tasks
    - Returns 404 (not 403) for unauthorized access to prevent enumeration attacks
    """
    # CRITICAL: Filter by current_user (from JWT token), NOT user_id (from URL)
    # This is the final defense layer - always use authenticated user_id in queries
    result = await session.exec(
        select(Task).where(Task.user_id == UUID(current_user))
    )
    tasks = result.all()

    return [
        TaskResponse(
            id=str(task.id),
            user_id=str(task.user_id),
            title=task.title,
            description=task.description,
            completed=task.completed,
            scheduled_date=task.scheduled_date,
            created_at=task.created_at,
            updated_at=task.updated_at
        )
        for task in tasks
    ]


@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: str = Depends(get_current_user),
    _: None = Depends(verify_user_access),
    session: AsyncSession = Depends(get_session)
):
    """
    Create new task for authenticated user.

    USER ISOLATION ENFORCEMENT:
    - Task is created with user_id from JWT token (current_user)
    - URL user_id parameter is validated but NOT used for task creation
    - This prevents users from creating tasks for other users
    """
    # CRITICAL: Use current_user (from JWT token), NOT user_id (from URL)
    # This ensures tasks are always created for the authenticated user
    new_task = Task(
        user_id=UUID(current_user),  # Use authenticated user_id
        title=task_data.title,
        description=task_data.description,
        scheduled_date=task_data.scheduled_date
    )

    session.add(new_task)
    await session.commit()
    await session.refresh(new_task)

    return TaskResponse(
        id=str(new_task.id),
        user_id=str(new_task.user_id),
        title=new_task.title,
        description=new_task.description,
        completed=new_task.completed,
        scheduled_date=new_task.scheduled_date,
        created_at=new_task.created_at,
        updated_at=new_task.updated_at
    )


@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: str,
    current_user: str = Depends(get_current_user),
    _: None = Depends(verify_user_access),
    session: AsyncSession = Depends(get_session)
):
    """
    Get specific task for authenticated user.

    USER ISOLATION ENFORCEMENT:
    - Query uses DUAL filters: task_id AND user_id (from token)
    - Returns 404 if task doesn't exist OR doesn't belong to user
    - 404 (not 403) prevents enumeration attacks - attacker can't tell if task exists
    """
    # CRITICAL: Dual filter ensures user can only access their own tasks
    # Task.id == task_id: Find the specific task
    # Task.user_id == current_user: Ensure it belongs to authenticated user
    result = await session.exec(
        select(Task).where(
            Task.id == UUID(task_id),
            Task.user_id == UUID(current_user)  # Filter by authenticated user
        )
    )
    task = result.first()

    if not task:
        # Return 404 (not 403) to prevent enumeration attacks
        # Attacker can't tell if task exists but is unauthorized vs doesn't exist
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return TaskResponse(
        id=str(task.id),
        user_id=str(task.user_id),
        title=task.title,
        description=task.description,
        completed=task.completed,
        scheduled_date=task.scheduled_date,
        created_at=task.created_at,
        updated_at=task.updated_at
    )


@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: str,
    task_data: TaskUpdate,
    current_user: str = Depends(get_current_user),
    _: None = Depends(verify_user_access),
    session: AsyncSession = Depends(get_session)
):
    """
    Update task for authenticated user.

    USER ISOLATION ENFORCEMENT:
    - Only updates title and description (completed status preserved)
    - Dual filter ensures user can only update their own tasks
    - updated_at timestamp automatically updated by SQLAlchemy onupdate
    """
    # CRITICAL: Dual filter prevents updating other users' tasks
    result = await session.exec(
        select(Task).where(
            Task.id == UUID(task_id),
            Task.user_id == UUID(current_user)  # Filter by authenticated user
        )
    )
    task = result.first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update only title and description (preserve completed status)
    # This endpoint is for editing task content, not completion status
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.scheduled_date is not None:
        task.scheduled_date = task_data.scheduled_date

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return TaskResponse(
        id=str(task.id),
        user_id=str(task.user_id),
        title=task.title,
        description=task.description,
        completed=task.completed,
        scheduled_date=task.scheduled_date,
        created_at=task.created_at,
        updated_at=task.updated_at
    )


@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    task_id: str,
    current_user: str = Depends(get_current_user),
    _: None = Depends(verify_user_access),
    session: AsyncSession = Depends(get_session)
):
    """
    Delete task for authenticated user.

    USER ISOLATION ENFORCEMENT:
    - Dual filter ensures user can only delete their own tasks
    - Returns 404 if task doesn't exist or doesn't belong to user
    - Idempotent: Second DELETE on same task returns 404
    """
    # CRITICAL: Dual filter prevents deleting other users' tasks
    result = await session.exec(
        select(Task).where(
            Task.id == UUID(task_id),
            Task.user_id == UUID(current_user)  # Filter by authenticated user
        )
    )
    task = result.first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    await session.delete(task)
    await session.commit()


@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    user_id: str,
    task_id: str,
    current_user: str = Depends(get_current_user),
    _: None = Depends(verify_user_access),
    session: AsyncSession = Depends(get_session)
):
    """
    Toggle task completion status for authenticated user.

    USER ISOLATION ENFORCEMENT:
    - Dual filter ensures user can only toggle their own tasks
    - Toggles between true/false (not task.completed = not task.completed)
    - updated_at timestamp automatically updated by SQLAlchemy onupdate
    """
    # CRITICAL: Dual filter prevents toggling other users' tasks
    result = await session.exec(
        select(Task).where(
            Task.id == UUID(task_id),
            Task.user_id == UUID(current_user)  # Filter by authenticated user
        )
    )
    task = result.first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Toggle completed status: true → false, false → true
    task.completed = not task.completed

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return TaskResponse(
        id=str(task.id),
        user_id=str(task.user_id),
        title=task.title,
        description=task.description,
        completed=task.completed,
        scheduled_date=task.scheduled_date,
        created_at=task.created_at,
        updated_at=task.updated_at
    )
