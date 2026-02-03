from sqlmodel import SQLModel, Field
from sqlalchemy import func
from datetime import datetime, date
from uuid import UUID, uuid4
from typing import Optional


class Task(SQLModel, table=True):
    """
    Task model for todo items.

    Represents a single task in the todo application with full CRUD support.
    Each task belongs to exactly one user (enforced via FOREIGN KEY).
    """

    __tablename__ = "tasks"

    # PRIMARY KEY constraint (T010)
    # Auto-generated UUID ensures globally unique task IDs
    id: UUID = Field(default_factory=uuid4, primary_key=True, nullable=False)

    # FOREIGN KEY constraint with INDEX (T011, T012)
    # References users.id to enforce referential integrity
    # Index on user_id enables fast filtering by user (critical for performance)
    user_id: UUID = Field(foreign_key="users.id", index=True, nullable=False)

    # Required fields with NOT NULL constraints (T013)
    # Title is required and limited to 500 characters for reasonable display
    title: str = Field(max_length=500, nullable=False)

    # Description is optional - users can create quick tasks without details
    description: Optional[str] = Field(default=None, nullable=True)

    # Scheduled date for task planning (optional)
    # Indexed for efficient filtering by date (Today, Upcoming, Inbox views)
    # Uses date type (not datetime) for day-level precision
    scheduled_date: Optional[date] = Field(default=None, nullable=True, index=True)

    # Completed status defaults to false for new tasks
    completed: bool = Field(default=False, nullable=False)

    # Timestamp fields with NOT NULL constraints (T013)
    # created_at is set once on task creation and never changes
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )

    # Auto-updating timestamp with onupdate (T014)
    # SQLAlchemy automatically updates this field on any UPDATE operation
    # This ensures updated_at always reflects the last modification time
    # No manual timestamp management needed in API endpoints
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": func.now()}
    )

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Complete project documentation",
                "description": "Write comprehensive docs for the API",
                "completed": False
            }
        }
