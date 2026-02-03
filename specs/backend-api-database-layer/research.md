# Research: Backend API & Database Layer

**Date**: 2026-01-29
**Feature**: Backend API & Database Layer
**Purpose**: Resolve technical unknowns for SQLModel async patterns, Alembic migrations, and asyncpg connection pooling

## Research Questions Resolved

### 1. SQLModel Async Support

**Question**: How to use SQLModel with async sessions and asyncpg driver?

**Decision**: Use SQLModel with async SQLAlchemy sessions via `AsyncSession` and `create_async_engine`

**Rationale**:
- SQLModel 0.0.14+ supports async operations through SQLAlchemy 2.0's async API
- Async operations prevent blocking the event loop under concurrent load
- Maintains type safety and Pydantic validation benefits of SQLModel

**Implementation Pattern**:
```python
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import select

# Create async engine
engine = create_async_engine(
    "postgresql+asyncpg://user:pass@host/db",
    echo=True,
    pool_pre_ping=True
)

# Use async session in endpoint
async def get_tasks(session: AsyncSession):
    result = await session.exec(select(Task).where(Task.user_id == user_id))
    tasks = result.all()
    return tasks
```

**Alternatives Considered**:
- Synchronous SQLModel: Rejected - blocks event loop, poor performance under load
- Raw asyncpg without ORM: Rejected - loses type safety and validation

**References**:
- SQLModel async documentation: https://sqlmodel.tiangolo.com/advanced/async/
- SQLAlchemy 2.0 async: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html

---

### 2. Auto-updating Timestamps

**Question**: How to handle auto-updating `updated_at` timestamps in SQLModel?

**Decision**: Use SQLAlchemy `onupdate` parameter with `func.now()` for `updated_at`

**Rationale**:
- Database-level timestamp management ensures consistency across all update paths
- Prevents bugs from forgetting to update timestamp in individual endpoints
- Works correctly with SQLModel's SQLAlchemy integration

**Implementation Pattern**:
```python
from sqlalchemy import func
from sqlmodel import Field
from datetime import datetime

class Task(SQLModel, table=True):
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

**Alternatives Considered**:
- Manual timestamp updates in each endpoint: Rejected - error-prone, easy to forget
- Client-provided timestamps: Rejected - security risk, clock skew issues
- Trigger-based timestamps: Rejected - adds database complexity, harder to test

**Testing Approach**:
- Verify `created_at` set on insert
- Verify `updated_at` changes on update
- Verify `updated_at` equals `created_at` immediately after creation

---

### 3. Alembic Configuration with SQLModel

**Question**: How to configure Alembic to auto-generate migrations from SQLModel metadata?

**Decision**: Configure Alembic with async engine and SQLModel metadata auto-detection

**Rationale**:
- Auto-generates migrations from model changes, reducing manual SQL writing
- Leverages SQLModel's type safety for schema definition
- Supports async database connections for consistency with application code

**Implementation Pattern**:

**alembic/env.py**:
```python
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
from app.models.user import User
from app.models.task import Task

# Import all models to ensure metadata is populated
target_metadata = SQLModel.metadata

async def run_migrations_online():
    connectable = create_async_engine(config.get_main_option("sqlalchemy.url"))

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
```

**alembic.ini**:
```ini
[alembic]
script_location = alembic
sqlalchemy.url = # Leave empty, will use DATABASE_URL from .env
```

**Migration Commands**:
```bash
# Create migration
alembic revision --autogenerate -m "Add tasks table"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

**Alternatives Considered**:
- Manual SQL migrations: Rejected - doesn't leverage SQLModel type safety
- Synchronous Alembic: Rejected - inconsistent with async application code
- No migrations (direct SQLModel.metadata.create_all): Rejected - no version control or rollback

**Best Practices**:
- Always review auto-generated migrations before applying
- Test both upgrade and downgrade paths
- Use descriptive migration messages
- Never edit applied migrations (create new ones instead)

---

### 4. Asyncpg Connection Pooling

**Question**: What are optimal pool settings for Neon PostgreSQL?

**Decision**: `pool_size=5, max_overflow=15, pool_pre_ping=True, pool_recycle=3600`

**Rationale**:
- Neon has connection limits (varies by plan, typically 100-1000)
- Conservative pool size prevents exhausting connections
- `max_overflow=15` allows bursts up to 20 total connections
- `pool_pre_ping=True` detects stale connections before use
- `pool_recycle=3600` (1 hour) prevents long-lived connection issues

**Implementation Pattern**:
```python
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,  # Test connections before use
    pool_size=5,  # Minimum connections in pool
    max_overflow=15,  # Additional connections allowed
    pool_recycle=3600,  # Recycle connections after 1 hour
    connect_args={
        "server_settings": {"application_name": "todo-api"}
    }
)
```

**Connection Pool Behavior**:
- Pool maintains 5 idle connections
- Under load, creates up to 15 additional connections (20 total)
- Requests wait if all 20 connections are in use
- Stale connections detected and recycled automatically

**Alternatives Considered**:
- Larger pool (pool_size=20): Rejected - wastes connections when idle
- No pool_pre_ping: Rejected - stale connections cause errors
- No pool_recycle: Rejected - long-lived connections can become unstable
- Smaller pool (pool_size=2): Rejected - insufficient for concurrent requests

**Monitoring**:
- Track pool size and overflow usage
- Alert on connection wait times
- Monitor Neon connection count

---

### 5. Async Session Dependency

**Question**: How to properly close async sessions after request completion?

**Decision**: Use FastAPI dependency with async context manager for automatic session cleanup

**Rationale**:
- Async context manager ensures session is closed even if endpoint raises exception
- FastAPI dependency injection handles lifecycle automatically
- Prevents connection leaks

**Implementation Pattern**:
```python
from typing import AsyncGenerator
from sqlmodel.ext.asyncio.session import AsyncSession

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSession(engine) as session:
        yield session
        # Session automatically closed after yield

# Use in endpoint
@router.get("/tasks")
async def get_tasks(
    session: AsyncSession = Depends(get_session),
    current_user: str = Depends(get_current_user)
):
    result = await session.exec(select(Task).where(Task.user_id == current_user))
    return result.all()
```

**Alternatives Considered**:
- Manual session management: Rejected - risk of connection leaks on exceptions
- Session per module: Rejected - not thread-safe, doesn't work with async
- Global session: Rejected - shared state causes concurrency issues

**Error Handling**:
- Session automatically rolled back on exception
- Connection returned to pool after session closes
- No manual cleanup required

---

### 6. Testing Async Endpoints

**Question**: How to create test database fixtures with async SQLModel?

**Decision**: Use pytest-asyncio with async fixtures and test database

**Implementation Pattern**:

**conftest.py**:
```python
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlmodel import SQLModel

@pytest.fixture(scope="session")
async def test_engine():
    engine = create_async_engine("postgresql+asyncpg://test:test@localhost/test_db")
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

@pytest.fixture
async def test_session(test_engine):
    async with AsyncSession(test_engine) as session:
        yield session
        await session.rollback()

@pytest.fixture
async def test_user(test_session):
    user = User(email="test@example.com", password_hash="hashed")
    test_session.add(user)
    await test_session.commit()
    return user
```

**test_tasks_api.py**:
```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_task(test_user, test_session):
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            f"/api/{test_user.id}/tasks",
            json={"title": "Test task"},
            headers={"Authorization": f"Bearer {test_token}"}
        )
    assert response.status_code == 201
```

**Alternatives Considered**:
- Synchronous tests: Rejected - doesn't test async behavior
- Mocking database: Rejected - doesn't test actual SQL queries
- Shared test database: Rejected - tests interfere with each other

---

## Summary

All technical unknowns have been resolved with concrete implementation patterns:

1. ✅ **SQLModel Async**: Use AsyncSession with create_async_engine
2. ✅ **Timestamps**: Use SQLAlchemy onupdate with func.now()
3. ✅ **Alembic**: Configure with async engine and SQLModel metadata
4. ✅ **Connection Pool**: pool_size=5, max_overflow=15, pool_pre_ping=True
5. ✅ **Session Management**: FastAPI dependency with async context manager
6. ✅ **Testing**: pytest-asyncio with async fixtures and test database

**Ready for Phase 1**: Design artifacts (data-model.md, contracts/, quickstart.md) can now be created with confidence in technical approach.
