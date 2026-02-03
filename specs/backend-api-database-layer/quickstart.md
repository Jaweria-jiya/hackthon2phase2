# Quickstart Guide: Backend API & Database Layer

**Date**: 2026-01-29
**Feature**: Backend API & Database Layer
**Purpose**: Step-by-step setup instructions for database, migrations, and API endpoints

## Prerequisites

Before starting, ensure you have:

- ✅ Python 3.11+ installed
- ✅ Neon PostgreSQL account with database created
- ✅ Backend from Spec 1 (Authentication & Security Layer) already set up
- ✅ Git repository initialized
- ✅ Virtual environment activated

## Step 1: Install Dependencies

Add new dependencies to `backend/requirements.txt`:

```bash
cd backend

# Add to requirements.txt:
# asyncpg==0.29.0
# alembic==1.13.0

# Install all dependencies
pip install -r requirements.txt
```

**Verify Installation**:
```bash
python -c "import asyncpg; import alembic; print('Dependencies installed successfully')"
```

---

## Step 2: Configure Database Connection

### Update Environment Variables

Edit `backend/.env` to use async driver:

```env
# Change from:
# DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require

# To (note the +asyncpg):
DATABASE_URL=postgresql+asyncpg://user:password@ep-xxx.neon.tech/dbname?sslmode=require

# Keep existing variables:
BETTER_AUTH_SECRET=PDvJcYDnogs3o0GWoiecYgEVom7T0Nf8YiRHj+gte6g=
CORS_ORIGINS=http://localhost:3000
```

### Update .env.example

```env
DATABASE_URL=postgresql+asyncpg://user:password@ep-xxx.neon.tech/dbname?sslmode=require
BETTER_AUTH_SECRET=<your-secret-here>
CORS_ORIGINS=http://localhost:3000
```

---

## Step 3: Update Database Configuration

### Update `backend/app/database.py`

Replace synchronous engine with async engine:

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from typing import AsyncGenerator
from app.config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,  # Test connections before use
    pool_size=5,  # Minimum connections
    max_overflow=15,  # Additional connections allowed
    pool_recycle=3600,  # Recycle connections after 1 hour
)

# Create async session factory
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def create_db_and_tables():
    """Create database tables (for development only)"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for database sessions"""
    async with async_session() as session:
        yield session
```

---

## Step 4: Create Task Model

Create `backend/app/models/task.py`:

```python
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional
from sqlalchemy import func

class Task(SQLModel, table=True):
    """Task entity representing a todo item"""
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True, nullable=False)
    user_id: UUID = Field(foreign_key="users.id", index=True, nullable=False)
    title: str = Field(max_length=500, nullable=False, min_length=1)
    description: Optional[str] = Field(default=None, nullable=True)
    completed: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": func.now()}
    )
```

Update `backend/app/models/__init__.py`:

```python
from app.models.user import User
from app.models.task import Task

__all__ = ["User", "Task"]
```

---

## Step 5: Initialize Alembic

### Initialize Alembic Directory

```bash
cd backend
alembic init alembic
```

This creates:
- `alembic/` directory
- `alembic.ini` configuration file
- `alembic/env.py` environment script

### Configure `alembic.ini`

Edit `backend/alembic.ini`:

```ini
[alembic]
script_location = alembic
prepend_sys_path = .

# Leave empty - will use DATABASE_URL from .env
sqlalchemy.url =

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

### Configure `alembic/env.py`

Replace contents of `backend/alembic/env.py`:

```python
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import all models to ensure metadata is populated
from app.models.user import User
from app.models.task import Task
from sqlmodel import SQLModel

# Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target metadata from SQLModel
target_metadata = SQLModel.metadata

# Get DATABASE_URL from environment
database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise ValueError("DATABASE_URL environment variable not set")

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode"""
    context.configure(
        url=database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    """Run migrations in 'online' mode"""
    connectable = create_async_engine(database_url, poolclass=pool.NullPool)

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
```

---

## Step 6: Create Initial Migration

### Generate Migration

```bash
cd backend
alembic revision --autogenerate -m "Add tasks table"
```

This creates a file like `alembic/versions/001_add_tasks_table.py`.

### Review Migration

Open the generated migration file and verify it includes:
- `tasks` table creation
- All columns (id, user_id, title, description, completed, created_at, updated_at)
- PRIMARY KEY constraint on `id`
- FOREIGN KEY constraint on `user_id` → `users.id`
- INDEX on `user_id`

**Example migration**:
```python
def upgrade():
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])

def downgrade():
    op.drop_index('idx_tasks_user_id', table_name='tasks')
    op.drop_table('tasks')
```

### Apply Migration

```bash
alembic upgrade head
```

**Expected Output**:
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 001, Add tasks table
```

---

## Step 7: Verify Database Schema

### Connect to Neon Database

Use Neon's SQL Editor or psql:

```bash
psql "postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"
```

### Verify Tables

```sql
-- List all tables
\dt

-- Should show:
-- users (from Spec 1)
-- tasks (newly created)
-- alembic_version (migration tracking)

-- Describe tasks table
\d tasks

-- Should show all columns and constraints
```

### Verify Constraints

```sql
-- Check PRIMARY KEY
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'tasks' AND constraint_type = 'PRIMARY KEY';

-- Check FOREIGN KEY
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'tasks' AND constraint_type = 'FOREIGN KEY';

-- Check INDEX
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'tasks';
```

---

## Step 8: Create Task API Endpoints

Create `backend/app/api/tasks.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List
from uuid import UUID

from app.models.task import Task
from app.database import get_session
from app.auth.dependencies import get_current_user, verify_user_access
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["tasks"])

# Request/Response models
class TaskCreate(BaseModel):
    title: str
    description: str | None = None

class TaskUpdate(BaseModel):
    title: str
    description: str | None = None

# Endpoints
@router.get("/{user_id}/tasks", response_model=List[Task])
async def get_tasks(
    user_id: str,
    current_user: str = Depends(get_current_user),
    _: None = Depends(verify_user_access),
    session: AsyncSession = Depends(get_session)
):
    """List all tasks for authenticated user"""
    result = await session.exec(
        select(Task).where(Task.user_id == UUID(current_user))
    )
    return result.all()

@router.post("/{user_id}/tasks", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: str = Depends(get_current_user),
    _: None = Depends(verify_user_access),
    session: AsyncSession = Depends(get_session)
):
    """Create new task for authenticated user"""
    new_task = Task(
        user_id=UUID(current_user),  # Use token user_id, not URL
        title=task_data.title,
        description=task_data.description
    )
    session.add(new_task)
    await session.commit()
    await session.refresh(new_task)
    return new_task

@router.get("/{user_id}/tasks/{id}", response_model=Task)
async def get_task(
    user_id: str,
    id: str,
    current_user: str = Depends(get_current_user),
    _: None = Depends(verify_user_access),
    session: AsyncSession = Depends(get_session)
):
    """Get single task by ID"""
    result = await session.exec(
        select(Task)
        .where(Task.id == UUID(id))
        .where(Task.user_id == UUID(current_user))
    )
    task = result.first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{user_id}/tasks/{id}", response_model=Task)
async def update_task(
    user_id: str,
    id: str,
    task_data: TaskUpdate,
    current_user: str = Depends(get_current_user),
    _: None = Depends(verify_user_access),
    session: AsyncSession = Depends(get_session)
):
    """Update task title and description"""
    result = await session.exec(
        select(Task)
        .where(Task.id == UUID(id))
        .where(Task.user_id == UUID(current_user))
    )
    task = result.first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.title = task_data.title
    task.description = task_data.description
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task

@router.delete("/{user_id}/tasks/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    id: str,
    current_user: str = Depends(get_current_user),
    _: None = Depends(verify_user_access),
    session: AsyncSession = Depends(get_session)
):
    """Delete task"""
    result = await session.exec(
        select(Task)
        .where(Task.id == UUID(id))
        .where(Task.user_id == UUID(current_user))
    )
    task = result.first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await session.delete(task)
    await session.commit()

@router.patch("/{user_id}/tasks/{id}/complete", response_model=Task)
async def toggle_complete(
    user_id: str,
    id: str,
    current_user: str = Depends(get_current_user),
    _: None = Depends(verify_user_access),
    session: AsyncSession = Depends(get_session)
):
    """Toggle task completion status"""
    result = await session.exec(
        select(Task)
        .where(Task.id == UUID(id))
        .where(Task.user_id == UUID(current_user))
    )
    task = result.first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = not task.completed
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task
```

### Update `backend/app/main.py`

Add tasks router:

```python
from app.api.tasks import router as tasks_router

# Add after auth router
app.include_router(tasks_router)
```

---

## Step 9: Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload --port 4000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:4000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify API Docs**:
- Open http://localhost:4000/docs
- Should see 6 new task endpoints under "tasks" tag

---

## Step 10: Test Endpoints

### 1. Sign Up and Get Token (from Spec 1)

```bash
# Sign up
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Response: {"user_id": "...", "email": "test@example.com", ...}

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Response: {"user_id": "550e8400-...", "token": "eyJhbGc..."}
```

Save the `user_id` and `token` for next steps.

### 2. Create Task

```bash
export TOKEN="your-jwt-token-here"
export USER_ID="your-user-id-here"

curl -X POST http://localhost:4000/api/$USER_ID/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```

**Expected Response** (201 Created):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-29T10:00:00Z",
  "updated_at": "2026-01-29T10:00:00Z"
}
```

### 3. List Tasks

```bash
curl -X GET http://localhost:4000/api/$USER_ID/tasks \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response** (200 OK):
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-01-29T10:00:00Z",
    "updated_at": "2026-01-29T10:00:00Z"
  }
]
```

### 4. Get Single Task

```bash
export TASK_ID="123e4567-e89b-12d3-a456-426614174000"

curl -X GET http://localhost:4000/api/$USER_ID/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Update Task

```bash
curl -X PUT http://localhost:4000/api/$USER_ID/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy organic groceries", "description": "Whole Foods"}'
```

### 6. Toggle Completion

```bash
curl -X PATCH http://localhost:4000/api/$USER_ID/tasks/$TASK_ID/complete \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Delete Task

```bash
curl -X DELETE http://localhost:4000/api/$USER_ID/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response** (204 No Content): Empty body

---

## Step 11: Verify User Isolation

### Create Second User

```bash
# Sign up second user
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user2@example.com", "password": "password123"}'

# Login second user
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user2@example.com", "password": "password123"}'

# Save user2's token and user_id
export TOKEN2="user2-jwt-token"
export USER_ID2="user2-user-id"
```

### Test Isolation

```bash
# User 1 creates task
curl -X POST http://localhost:4000/api/$USER_ID/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "User 1 task"}'

# User 2 tries to access User 1's tasks (should get empty array)
curl -X GET http://localhost:4000/api/$USER_ID2/tasks \
  -H "Authorization: Bearer $TOKEN2"

# Expected: [] (empty array - user 2 has no tasks)

# User 2 tries to access User 1's task directly (should get 403)
curl -X GET http://localhost:4000/api/$USER_ID/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN2"

# Expected: 403 Forbidden or 404 Not Found
```

---

## Migration Rollback Procedures

### Rolling Back Migrations

If you need to undo a migration (e.g., due to errors or schema changes):

```bash
cd backend

# Rollback one migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision_id>

# Rollback all migrations
alembic downgrade base
```

### Verify Rollback

After rolling back, verify the schema changes:

```sql
-- Connect to database
psql "postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"

-- Check if tasks table was removed
\dt

-- Should NOT show tasks table after rollback
```

### Re-apply Migration

To re-apply after rollback:

```bash
alembic upgrade head
```

### View Migration History

```bash
# Show all migrations and their status
alembic history

# Show current revision
alembic current

# Show pending migrations
alembic heads
```

### Best Practices

1. **Always review auto-generated migrations** before applying
2. **Test rollback in development** before deploying to production
3. **Never edit applied migrations** - create new ones instead
4. **Keep migrations small and focused** - one logical change per migration
5. **Document breaking changes** in migration docstrings

---

## Troubleshooting

### Issue: "DATABASE_URL not set"

**Solution**: Verify `.env` file exists and contains `DATABASE_URL`

```bash
cd backend
cat .env | grep DATABASE_URL
```

### Issue: "asyncpg.exceptions.InvalidCatalogNameError"

**Solution**: Database doesn't exist. Create it in Neon dashboard first.

### Issue: "relation 'tasks' does not exist"

**Solution**: Run Alembic migrations

```bash
cd backend
alembic upgrade head
```

### Issue: "401 Unauthorized" on all requests

**Solution**: Verify JWT token is valid and not expired (7-day expiration from Spec 1)

```bash
# Login again to get fresh token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### Issue: "422 Validation Error: title required"

**Solution**: Ensure request body includes `title` field

```bash
# Correct
curl -X POST http://localhost:4000/api/$USER_ID/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "My task"}'
```

### Issue: Connection pool exhausted

**Solution**: Check pool settings in `database.py`, increase `max_overflow` if needed

### Issue: "sslmode parameter not supported"

**Solution**: asyncpg uses `ssl=require` instead of `sslmode=require`. Update DATABASE_URL:

```env
# Wrong (psycopg2 format)
DATABASE_URL=postgresql+asyncpg://...?sslmode=require

# Correct (asyncpg format)
DATABASE_URL=postgresql+asyncpg://...?ssl=require
```

### Issue: Migration conflicts

**Solution**: Check for duplicate revision IDs

```bash
alembic history
# Look for conflicts or branches

# If found, resolve by creating merge migration
alembic merge -m "Merge conflicting migrations" <rev1> <rev2>
```

### Issue: "updated_at not updating automatically"

**Solution**: Verify `onupdate=func.now()` is set in Task model and migration was applied

```python
# In Task model
updated_at: datetime = Field(
    default_factory=datetime.utcnow,
    nullable=False,
    sa_column_kwargs={"onupdate": func.now()}
)
```

### Issue: Slow query performance

**Solution**: Verify indexes exist on frequently queried columns

```sql
-- Check indexes
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'tasks';

-- Should show index on user_id
```

---

## Next Steps

1. ✅ Backend API is now running with 6 task endpoints
2. ✅ Database schema deployed with proper constraints
3. ✅ User isolation enforced at query level
4. ⏭️ Run `/sp.tasks` to generate detailed task breakdown
5. ⏭️ Implement integration tests for all endpoints
6. ⏭️ Deploy to staging environment

## Summary

**Completed**:
- ✅ Async database engine with asyncpg
- ✅ Connection pooling configured
- ✅ Task model with constraints
- ✅ Alembic migrations initialized
- ✅ Database schema deployed
- ✅ 6 API endpoints implemented
- ✅ User isolation enforced

**Ready for**: Implementation phase with `/sp.tasks` command
