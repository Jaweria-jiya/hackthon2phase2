from typing import AsyncGenerator
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from app.config import settings


# Create async database engine with connection pooling
# Connection pool configuration optimized for Neon PostgreSQL serverless
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,  # Set to False in production to reduce log verbosity

    # pool_pre_ping: Test connections before using them
    # Detects stale connections that may have been closed by the database
    # Critical for serverless databases like Neon that may close idle connections
    pool_pre_ping=True,

    # pool_size: Minimum number of connections to maintain in the pool
    # Set to 5 to balance between connection overhead and availability
    # Lower values reduce resource usage, higher values improve concurrency
    pool_size=5,

    # max_overflow: Additional connections allowed beyond pool_size
    # Total max connections = pool_size + max_overflow = 20
    # Allows handling traffic spikes without exhausting database connections
    max_overflow=15,

    # pool_recycle: Recycle connections after 1 hour (3600 seconds)
    # Prevents long-lived connections from becoming stale or unstable
    # Recommended for cloud databases with connection time limits
    pool_recycle=3600,

    # connect_args: Additional connection parameters
    # application_name helps identify connections in database logs
    connect_args={
        "server_settings": {"application_name": "todo-api"}
    }
)


async def create_db_and_tables():
    """
    Create all database tables (for development use).

    Uses SQLModel.metadata.create_all() to generate tables from model definitions.
    In production, use Alembic migrations instead for version control and rollback support.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency to get async database session.

    Provides an async context manager that:
    1. Creates a new session for each request
    2. Automatically commits on success
    3. Automatically rolls back on exception
    4. Always closes the session after request completes

    Usage in endpoints:
        @router.get("/tasks")
        async def get_tasks(session: AsyncSession = Depends(get_session)):
            result = await session.exec(select(Task))
            return result.all()
    """
    async with AsyncSession(engine) as session:
        yield session
        # Session automatically closed after yield
