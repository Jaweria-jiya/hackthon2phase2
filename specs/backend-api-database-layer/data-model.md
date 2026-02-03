# Data Model: Backend API & Database Layer

**Date**: 2026-01-29
**Feature**: Backend API & Database Layer
**Purpose**: Define database schema, constraints, and validation rules for Task entity

## Entity: Task

### Overview

**Purpose**: Represents a todo item with title, optional description, completion status, and user ownership.

**Lifecycle**:
1. Created with `completed = false` by default
2. Can be updated (title, description)
3. Can be toggled between completed/incomplete
4. Can be deleted (hard delete, no soft delete)

**Ownership**: Each task belongs to exactly one user. User isolation enforced at query level.

---

## Schema Definition

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | uuid4() | Unique task identifier |
| `user_id` | UUID | FOREIGN KEY (users.id), NOT NULL, INDEXED | - | Owner of the task |
| `title` | VARCHAR(500) | NOT NULL | - | Task title (required) |
| `description` | TEXT | NULLABLE | NULL | Optional task description |
| `completed` | BOOLEAN | NOT NULL | false | Completion status |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | now() | Creation timestamp |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | now() | Last update timestamp |

### Constraints

**Primary Key**:
```sql
PRIMARY KEY (id)
```

**Foreign Key**:
```sql
FOREIGN KEY (user_id) REFERENCES users(id)
-- No CASCADE DELETE - explicit handling required
```

**Not Null Constraints**:
- `id`: Always required (auto-generated)
- `user_id`: Task must belong to a user
- `title`: Task must have a title
- `completed`: Boolean cannot be null (default false)
- `created_at`: Timestamp always set on creation
- `updated_at`: Timestamp always set on creation and update

**Indexes**:
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
-- Optimizes queries filtering by user_id (most common query pattern)
```

**Check Constraints** (enforced by application):
- `title` length: 1-500 characters (Pydantic validation)
- `user_id` format: Valid UUID (Pydantic validation)

---

## SQLModel Implementation

```python
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional
from sqlalchemy import func

class Task(SQLModel, table=True):
    """
    Task entity representing a todo item.

    Attributes:
        id: Unique task identifier (auto-generated UUID)
        user_id: Foreign key to users table (owner)
        title: Task title (required, max 500 chars)
        description: Optional task description
        completed: Completion status (default false)
        created_at: Creation timestamp (auto-generated)
        updated_at: Last update timestamp (auto-updated)
    """
    __tablename__ = "tasks"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False
    )

    user_id: UUID = Field(
        foreign_key="users.id",
        index=True,
        nullable=False
    )

    title: str = Field(
        max_length=500,
        nullable=False,
        min_length=1
    )

    description: Optional[str] = Field(
        default=None,
        nullable=True
    )

    completed: bool = Field(
        default=False,
        nullable=False
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": func.now()}
    )
```

---

## Validation Rules

### Title Validation
- **Required**: Cannot be null or empty
- **Length**: 1-500 characters
- **Type**: String
- **Validation Error**: 422 Unprocessable Entity with message "Field required: title" or "Title must be 500 characters or less"

### Description Validation
- **Optional**: Can be null or empty string
- **Length**: No limit (TEXT type)
- **Type**: String or null
- **Behavior**: NULL and empty string are both valid

### User ID Validation
- **Required**: Cannot be null
- **Format**: Valid UUID v4
- **Authorization**: Must match authenticated user's ID from JWT token
- **Validation Error**: 422 for invalid UUID format, 403 for user_id mismatch

### Completed Validation
- **Type**: Boolean only (true or false)
- **Default**: false for new tasks
- **Behavior**: Cannot be null

### Timestamp Validation
- **Auto-managed**: Client cannot set or override timestamps
- **Format**: ISO 8601 with timezone
- **Behavior**:
  - `created_at`: Set once on creation, never changes
  - `updated_at`: Set on creation, auto-updated on any modification

---

## Relationships

### Belongs To: User

**Relationship**: Many-to-One (many tasks belong to one user)

**Foreign Key**: `tasks.user_id` → `users.id`

**Cascade Behavior**: No cascade delete
- If user is deleted, tasks remain in database (orphaned)
- Application must handle user deletion explicitly
- Alternative: Add ON DELETE CASCADE if tasks should be deleted with user

**Query Pattern**:
```python
# Get all tasks for a user
tasks = await session.exec(
    select(Task).where(Task.user_id == user_id)
)
```

---

## State Transitions

### Creation
```
[No Task] → POST /api/{user_id}/tasks → [Task with completed=false]
```

**Initial State**:
- `id`: Auto-generated UUID
- `user_id`: From authenticated JWT token
- `title`: From request body
- `description`: From request body or NULL
- `completed`: false (default)
- `created_at`: Current timestamp
- `updated_at`: Current timestamp (same as created_at)

### Update
```
[Task] → PUT /api/{user_id}/tasks/{id} → [Task with new title/description]
```

**State Changes**:
- `title`: Updated to new value
- `description`: Updated to new value or NULL
- `completed`: Preserved (not changed by PUT)
- `updated_at`: Auto-updated to current timestamp
- `created_at`: Unchanged

### Toggle Completion
```
[Task with completed=false] → PATCH /api/{user_id}/tasks/{id}/complete → [Task with completed=true]
[Task with completed=true] → PATCH /api/{user_id}/tasks/{id}/complete → [Task with completed=false]
```

**State Changes**:
- `completed`: Toggled (true ↔ false)
- `updated_at`: Auto-updated to current timestamp
- All other fields: Unchanged

### Deletion
```
[Task] → DELETE /api/{user_id}/tasks/{id} → [No Task]
```

**State Changes**:
- Task removed from database (hard delete)
- No soft delete or `deleted_at` timestamp
- Subsequent queries return 404

---

## Query Patterns

### User Isolation (Critical)

**All queries MUST filter by authenticated user_id**:

```python
# CORRECT: Filters by authenticated user
result = await session.exec(
    select(Task).where(Task.user_id == current_user_id)
)

# WRONG: Uses user_id from URL (security vulnerability)
result = await session.exec(
    select(Task).where(Task.user_id == url_user_id)
)
```

### List All Tasks for User
```python
async def get_tasks(user_id: str, session: AsyncSession):
    result = await session.exec(
        select(Task)
        .where(Task.user_id == UUID(user_id))
        .order_by(Task.created_at.desc())
    )
    return result.all()
```

### Get Single Task with Ownership Check
```python
async def get_task(task_id: str, user_id: str, session: AsyncSession):
    result = await session.exec(
        select(Task)
        .where(Task.id == UUID(task_id))
        .where(Task.user_id == UUID(user_id))
    )
    task = result.first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
```

### Update Task with Ownership Check
```python
async def update_task(task_id: str, user_id: str, data: dict, session: AsyncSession):
    result = await session.exec(
        select(Task)
        .where(Task.id == UUID(task_id))
        .where(Task.user_id == UUID(user_id))
    )
    task = result.first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.title = data.get("title", task.title)
    task.description = data.get("description", task.description)
    # updated_at auto-updated by SQLAlchemy onupdate

    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task
```

### Toggle Completion
```python
async def toggle_complete(task_id: str, user_id: str, session: AsyncSession):
    result = await session.exec(
        select(Task)
        .where(Task.id == UUID(task_id))
        .where(Task.user_id == UUID(user_id))
    )
    task = result.first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = not task.completed
    # updated_at auto-updated by SQLAlchemy onupdate

    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task
```

### Delete Task with Ownership Check
```python
async def delete_task(task_id: str, user_id: str, session: AsyncSession):
    result = await session.exec(
        select(Task)
        .where(Task.id == UUID(task_id))
        .where(Task.user_id == UUID(user_id))
    )
    task = result.first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await session.delete(task)
    await session.commit()
```

---

## Database Migration

### Initial Migration

**File**: `alembic/versions/001_add_tasks_table.py`

```python
"""Add tasks table

Revision ID: 001
Revises:
Create Date: 2026-01-29
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])

def downgrade():
    op.drop_index('idx_tasks_user_id', table_name='tasks')
    op.drop_table('tasks')
```

---

## Testing Considerations

### Schema Validation Tests
- Verify PRIMARY KEY constraint prevents duplicate IDs
- Verify FOREIGN KEY constraint prevents invalid user_ids
- Verify NOT NULL constraints reject null values
- Verify INDEX exists on user_id column

### Timestamp Tests
- Verify `created_at` set on insert
- Verify `updated_at` equals `created_at` immediately after creation
- Verify `updated_at` changes on update
- Verify `created_at` never changes after creation

### User Isolation Tests
- Create tasks for user A and user B
- Verify user A cannot query user B's tasks
- Verify user A cannot update user B's tasks
- Verify user A cannot delete user B's tasks

### Validation Tests
- Test title required (422 error)
- Test title max length (422 error)
- Test invalid UUID format (422 error)
- Test description can be null
- Test completed defaults to false

---

## Performance Considerations

### Index Usage
- `idx_tasks_user_id`: Optimizes `WHERE user_id = ?` queries (most common)
- Primary key index: Optimizes `WHERE id = ?` queries

### Query Optimization
- Always filter by user_id first (uses index)
- Avoid SELECT * (specify needed columns)
- Use pagination for large result sets (future enhancement)

### Connection Pooling
- Pool size: 5 minimum, 20 maximum
- Prevents connection exhaustion under load
- See research.md for detailed pool configuration

---

## Summary

**Entity**: Task
**Table**: tasks
**Fields**: 7 (id, user_id, title, description, completed, created_at, updated_at)
**Constraints**: PRIMARY KEY, FOREIGN KEY, NOT NULL (5 fields), INDEX (user_id)
**Relationships**: Belongs to User (many-to-one)
**State Transitions**: Create → Update → Toggle → Delete
**Security**: User isolation enforced at query level with WHERE user_id = current_user
