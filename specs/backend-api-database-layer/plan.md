# Implementation Plan: Backend API & Database Layer

**Branch**: `002-backend-api-database-layer` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/backend-api-database-layer/spec.md`

## Summary

Implement 6 RESTful API endpoints for task CRUD operations with SQLModel ORM, Neon PostgreSQL database, and Alembic migrations. All endpoints enforce user data isolation at query level with defense-in-depth security. Database schema includes proper constraints (PRIMARY KEY, FOREIGN KEY, NOT NULL, INDEX) and auto-managed timestamps. Async connection pooling with asyncpg prevents connection exhaustion under concurrent load.

**Primary Requirement**: Build production-ready task management API with complete CRUD operations, database schema with constraints, and version-controlled migrations.

**Technical Approach**: Use SQLModel for type-safe ORM with Pydantic validation, async FastAPI endpoints with dependency injection for user authentication, Alembic for schema versioning, and asyncpg connection pooling for performance.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI 0.109+, SQLModel 0.0.14+, asyncpg 0.29+, Alembic 1.13+, python-jose[cryptography] 3.3+ (for JWT verification from Spec 1)
**Storage**: Neon Serverless PostgreSQL with connection pooling (min_size=5, max_size=20, pool_pre_ping=True)
**Testing**: pytest 7.4+ with pytest-asyncio for async endpoint testing, httpx for API client testing
**Target Platform**: Linux server (production), Windows/macOS (development)
**Project Type**: Web application (backend only - this spec focuses on API layer)
**Performance Goals**: <200ms p95 latency for task operations, handle 50 concurrent requests without connection errors
**Constraints**: All queries MUST filter by authenticated user_id, no cascade deletes (explicit handling), JSON-only request/response format
**Scale/Scope**: 6 API endpoints, 1 database table (tasks), 8 user stories, estimated 3-4 hours implementation time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle IV: User Data Isolation ✅
- **Requirement**: All `/api/{user_id}/*` endpoints MUST verify user_id matches token sub claim
- **Implementation**: Use `get_current_user()` and `verify_user_access()` dependencies from Spec 1 (Authentication & Security Layer)
- **Query-level enforcement**: All SQLModel queries include `WHERE user_id = <token_user_id>` filter
- **Status**: PASS - Spec explicitly requires user isolation at both middleware and query levels (FR-020 to FR-025)

### Principle V: Configuration Reproducibility ✅
- **Requirement**: DATABASE_URL from environment variables, never hardcoded
- **Implementation**: Use pydantic_settings to load DATABASE_URL from .env file
- **Documentation**: .env.example includes DATABASE_URL placeholder with Neon connection string format
- **Status**: PASS - Spec requires environment variable configuration (FR-036)

### Principle VI: API Security Standards ✅
- **Requirement**: Consistent status codes (401, 403, 404, 422, 503)
- **Implementation**:
  - 404 for not found OR unauthorized (prevents enumeration per FR-030)
  - 422 for validation errors with clear messages (FR-026 to FR-028)
  - 503 for database connection failures (FR-032)
- **Status**: PASS - Spec defines all required status codes and error handling

### Technology Stack Constraints ✅
- **Database**: Neon Serverless PostgreSQL ✅
- **ORM**: SQLModel (combines SQLAlchemy + Pydantic) ✅
- **Migrations**: Alembic ✅
- **Framework**: FastAPI with async/await ✅
- **Status**: PASS - All technology choices align with constitution

### Additional Checks
- **No new authentication logic**: This spec builds on Spec 1's JWT authentication ✅
- **Async-first**: All endpoints use async def and await for database operations ✅
- **No SQL injection**: SQLModel ORM with parameterized queries ✅

**GATE RESULT**: ✅ PASS - All constitution principles satisfied, no violations to justify

## Project Structure

### Documentation (this feature)

```text
specs/backend-api-database-layer/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - SQLModel patterns, Alembic setup, asyncpg best practices
├── data-model.md        # Phase 1 output - Task entity schema with constraints
├── quickstart.md        # Phase 1 output - Setup instructions for database and migrations
├── contracts/           # Phase 1 output - OpenAPI schema for 6 endpoints
│   └── tasks-api.yaml   # OpenAPI 3.0 specification
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # Existing from Spec 1
│   │   └── task.py          # NEW - Task SQLModel with constraints
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py          # Existing from Spec 1
│   │   └── tasks.py         # NEW - 6 CRUD endpoints
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── jwt.py           # Existing from Spec 1
│   │   └── dependencies.py  # Existing from Spec 1 - get_current_user(), verify_user_access()
│   ├── config.py            # UPDATE - Add connection pool settings
│   ├── database.py          # UPDATE - Add async engine with asyncpg
│   └── main.py              # UPDATE - Include tasks router
├── alembic/                 # NEW - Migration directory
│   ├── versions/            # Migration files
│   ├── env.py               # Alembic environment config
│   └── script.py.mako       # Migration template
├── alembic.ini              # NEW - Alembic configuration
├── requirements.txt         # UPDATE - Add asyncpg, alembic
└── tests/
    ├── test_tasks_api.py    # NEW - Integration tests for 6 endpoints
    └── conftest.py          # UPDATE - Add async test fixtures

frontend/
└── [No changes - frontend integration is separate spec]
```

**Structure Decision**: Web application structure with backend/ directory. This spec focuses exclusively on backend API layer. Frontend integration (calling these endpoints) is handled by separate frontend specification. Authentication middleware (JWT verification) is provided by Spec 1 (Authentication & Security Layer).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected - this section is empty.

## Phase 0: Research & Discovery

**Goal**: Resolve all technical unknowns and establish best practices for SQLModel async patterns, Alembic migrations, and asyncpg connection pooling.

### Research Tasks

1. **SQLModel Async Patterns**
   - Research: How to use SQLModel with async sessions and asyncpg driver
   - Question: Does SQLModel support async select() queries natively?
   - Question: How to handle auto-updating `updated_at` timestamps in SQLModel?
   - Output: Code patterns for async CRUD operations with SQLModel

2. **Alembic Setup with SQLModel**
   - Research: How to configure Alembic to auto-generate migrations from SQLModel metadata
   - Question: How to handle async database connections in Alembic env.py?
   - Question: Best practices for migration naming and versioning
   - Output: Alembic configuration template and migration workflow

3. **Asyncpg Connection Pooling**
   - Research: Optimal pool settings for Neon PostgreSQL (min_size, max_size, timeout)
   - Question: How to configure pool_pre_ping for stale connection detection?
   - Question: How to handle connection pool exhaustion gracefully?
   - Output: Connection pool configuration and error handling patterns

4. **FastAPI Async Dependencies**
   - Research: How to use async dependencies with SQLModel sessions
   - Question: How to properly close async sessions after request completion?
   - Question: Best practices for dependency injection with async database operations
   - Output: Dependency patterns for get_session() with async context managers

5. **Testing Async Endpoints**
   - Research: pytest-asyncio setup for testing FastAPI async endpoints
   - Question: How to create test database fixtures with async SQLModel?
   - Question: How to test user isolation with multiple test users?
   - Output: Test fixtures and patterns for async API testing

### Research Output: research.md

**Decision 1: SQLModel Async Support**
- **Chosen**: Use SQLModel with async SQLAlchemy sessions via `AsyncSession` and `create_async_engine`
- **Rationale**: SQLModel 0.0.14+ supports async operations through SQLAlchemy 2.0's async API
- **Pattern**:
  ```python
  from sqlmodel.ext.asyncio.session import AsyncSession
  from sqlalchemy.ext.asyncio import create_async_engine

  async with AsyncSession(engine) as session:
      result = await session.exec(select(Task).where(Task.user_id == user_id))
      tasks = result.all()
  ```
- **Alternatives considered**: Synchronous SQLModel (rejected - blocks event loop under load)

**Decision 2: Auto-updating Timestamps**
- **Chosen**: Use SQLAlchemy `onupdate` parameter with `func.now()` for `updated_at`
- **Rationale**: Database-level timestamp management ensures consistency across all update paths
- **Pattern**:
  ```python
  from sqlalchemy import func
  updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": func.now()})
  ```
- **Alternatives considered**: Manual timestamp updates in each endpoint (rejected - error-prone)

**Decision 3: Alembic Configuration**
- **Chosen**: Configure Alembic with async engine and SQLModel metadata auto-detection
- **Rationale**: Auto-generates migrations from model changes, reducing manual SQL writing
- **Pattern**: Set `target_metadata = SQLModel.metadata` in env.py, use `run_async` for migrations
- **Alternatives considered**: Manual SQL migrations (rejected - doesn't leverage SQLModel type safety)

**Decision 4: Connection Pool Settings**
- **Chosen**: `min_size=5, max_size=20, pool_pre_ping=True, pool_recycle=3600`
- **Rationale**: Balances connection reuse with Neon's connection limits, pre_ping detects stale connections
- **Pattern**:
  ```python
  engine = create_async_engine(
      DATABASE_URL,
      echo=True,
      pool_pre_ping=True,
      pool_size=5,
      max_overflow=15,
      pool_recycle=3600
  )
  ```
- **Alternatives considered**: Larger pool (rejected - Neon has connection limits), no pre_ping (rejected - stale connections cause errors)

**Decision 5: Async Session Dependency**
- **Chosen**: Use FastAPI dependency with async context manager for automatic session cleanup
- **Rationale**: Ensures sessions are properly closed even if endpoint raises exception
- **Pattern**:
  ```python
  async def get_session() -> AsyncGenerator[AsyncSession, None]:
      async with AsyncSession(engine) as session:
          yield session
  ```
- **Alternatives considered**: Manual session management (rejected - risk of connection leaks)

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete

### 1. Data Model Design

**Output**: data-model.md

#### Task Entity

**Purpose**: Represents a todo item with title, optional description, completion status, and ownership.

**Fields**:
- `id`: UUID (PRIMARY KEY, auto-generated with uuid4)
- `user_id`: UUID (FOREIGN KEY to users.id, NOT NULL, indexed)
- `title`: str (max 500 chars, NOT NULL)
- `description`: Optional[str] (TEXT, nullable)
- `completed`: bool (DEFAULT false, NOT NULL)
- `created_at`: datetime (TIMESTAMP WITH TIME ZONE, NOT NULL, auto-generated)
- `updated_at`: datetime (TIMESTAMP WITH TIME ZONE, NOT NULL, auto-updated on modification)

**Constraints**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` REFERENCES `users(id)`
- NOT NULL: `id`, `user_id`, `title`, `completed`, `created_at`, `updated_at`
- INDEX: `user_id` (for query performance on user-filtered queries)
- CHECK: `title` length > 0 (enforced by Pydantic validation)

**Relationships**:
- Belongs to: User (many-to-one via `user_id`)
- No cascade delete: If user is deleted, tasks remain (or explicit handling required)

**Validation Rules**:
- `title`: Required, 1-500 characters
- `description`: Optional, no length limit
- `user_id`: Must be valid UUID, must match authenticated user
- `completed`: Boolean only (no null)

**State Transitions**:
- Created: `completed = false` by default
- Toggle: `completed` can switch between true/false via PATCH endpoint
- Update: `updated_at` automatically updated on any modification

**SQLModel Implementation**:
```python
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional
from sqlalchemy import func

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True, nullable=False)
    title: str = Field(max_length=500, nullable=False)
    description: Optional[str] = Field(default=None, nullable=True)
    completed: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": func.now()}
    )
```

### 2. API Contracts

**Output**: contracts/tasks-api.yaml (OpenAPI 3.0 specification)

#### Endpoint 1: List Tasks
- **Method**: GET
- **Path**: `/api/{user_id}/tasks`
- **Auth**: Required (JWT Bearer token)
- **Path Parameters**: `user_id` (UUID, must match token sub claim)
- **Response 200**: Array of Task objects
- **Response 401**: Unauthorized (invalid/missing token)
- **Response 403**: Forbidden (user_id mismatch)

#### Endpoint 2: Create Task
- **Method**: POST
- **Path**: `/api/{user_id}/tasks`
- **Auth**: Required (JWT Bearer token)
- **Path Parameters**: `user_id` (UUID, must match token sub claim)
- **Request Body**: `{"title": "string", "description": "string (optional)"}`
- **Response 201**: Created Task object with auto-generated id, timestamps, completed=false
- **Response 422**: Validation error (missing title, title too long, invalid format)

#### Endpoint 3: Get Single Task
- **Method**: GET
- **Path**: `/api/{user_id}/tasks/{id}`
- **Auth**: Required (JWT Bearer token)
- **Path Parameters**: `user_id` (UUID), `id` (UUID)
- **Response 200**: Task object
- **Response 404**: Not found or unauthorized (prevents enumeration)
- **Response 422**: Invalid UUID format

#### Endpoint 4: Update Task
- **Method**: PUT
- **Path**: `/api/{user_id}/tasks/{id}`
- **Auth**: Required (JWT Bearer token)
- **Path Parameters**: `user_id` (UUID), `id` (UUID)
- **Request Body**: `{"title": "string", "description": "string (optional)"}`
- **Response 200**: Updated Task object with new updated_at timestamp
- **Response 404**: Not found or unauthorized
- **Response 422**: Validation error (empty title, title too long)

#### Endpoint 5: Delete Task
- **Method**: DELETE
- **Path**: `/api/{user_id}/tasks/{id}`
- **Auth**: Required (JWT Bearer token)
- **Path Parameters**: `user_id` (UUID), `id` (UUID)
- **Response 204**: No Content (task deleted successfully)
- **Response 404**: Not found or unauthorized

#### Endpoint 6: Toggle Task Completion
- **Method**: PATCH
- **Path**: `/api/{user_id}/tasks/{id}/complete`
- **Auth**: Required (JWT Bearer token)
- **Path Parameters**: `user_id` (UUID), `id` (UUID)
- **Request Body**: None (toggle behavior)
- **Response 200**: Updated Task object with toggled completed status
- **Response 404**: Not found or unauthorized

### 3. Quickstart Guide

**Output**: quickstart.md

#### Prerequisites
- Python 3.11+ installed
- Neon PostgreSQL account with database created
- Backend from Spec 1 (Authentication & Security Layer) already set up

#### Step 1: Install Dependencies
```bash
cd backend
pip install asyncpg==0.29.0 alembic==1.13.0
# SQLModel and FastAPI already installed from Spec 1
```

#### Step 2: Configure Database Connection
Update `backend/.env`:
```env
DATABASE_URL=postgresql+asyncpg://user:password@ep-xxx.neon.tech/dbname?sslmode=require
# Note: Use postgresql+asyncpg:// prefix for async driver
```

#### Step 3: Initialize Alembic
```bash
cd backend
alembic init alembic
# Edit alembic.ini: set sqlalchemy.url = (leave empty, will use env var)
# Edit alembic/env.py: import SQLModel.metadata, configure async engine
```

#### Step 4: Create Initial Migration
```bash
alembic revision --autogenerate -m "Add tasks table"
# Review generated migration in alembic/versions/
alembic upgrade head
```

#### Step 5: Verify Schema
```bash
# Connect to Neon database and verify:
# - tasks table exists
# - Columns: id, user_id, title, description, completed, created_at, updated_at
# - Constraints: PRIMARY KEY (id), FOREIGN KEY (user_id), INDEX (user_id)
```

#### Step 6: Start Backend Server
```bash
uvicorn app.main:app --reload --port 4000
# API docs available at http://localhost:4000/docs
```

#### Step 7: Test Endpoints
```bash
# 1. Sign up and get JWT token (from Spec 1)
# 2. Create task: POST /api/{user_id}/tasks with Authorization header
# 3. List tasks: GET /api/{user_id}/tasks
# 4. Verify user isolation: Try accessing with different user_id (should get 403)
```

## Phase 2: Implementation Phases

**Note**: Detailed task breakdown will be generated by `/sp.tasks` command. This section provides high-level phase structure.

### Phase 2.1: Database Foundation (Blocking)
**Goal**: Set up async database engine, connection pooling, and Task model

**Tasks**:
1. Update `backend/app/database.py` with async engine using asyncpg
2. Configure connection pool settings (min_size=5, max_size=20, pool_pre_ping=True)
3. Create async `get_session()` dependency with AsyncSession
4. Create `backend/app/models/task.py` with Task SQLModel
5. Initialize Alembic with async configuration
6. Generate initial migration for tasks table
7. Apply migration to Neon database
8. Verify schema with database inspection

**Validation**: Can connect to database, create async session, query tasks table (empty)

### Phase 2.2: User Story 1 - Task Creation and Retrieval (P1 MVP)
**Goal**: Implement POST and GET list endpoints

**Tasks**:
1. Create `backend/app/api/tasks.py` with FastAPI router
2. Implement POST `/api/{user_id}/tasks` endpoint
   - Use `get_current_user()` and `verify_user_access()` dependencies
   - Validate request body with Pydantic model
   - Create task with `user_id` from token (not URL)
   - Return 201 with created task
3. Implement GET `/api/{user_id}/tasks` endpoint
   - Filter query by authenticated user_id
   - Return 200 with task array
4. Add tasks router to `backend/app/main.py`
5. Write integration tests for both endpoints
6. Test user isolation (user A cannot see user B's tasks)

**Validation**: Can create tasks and retrieve them, user isolation enforced

### Phase 2.3: User Story 2 - Single Task Retrieval (P1)
**Goal**: Implement GET single endpoint

**Tasks**:
1. Implement GET `/api/{user_id}/tasks/{id}` endpoint
   - Query with user_id and task_id filters
   - Return 404 if not found or unauthorized
   - Return 200 with task object
2. Add UUID validation for path parameters
3. Write integration tests for retrieval and 404 cases
4. Test ownership enforcement

**Validation**: Can retrieve specific tasks, unauthorized access returns 404

### Phase 2.4: User Story 3 - Task Update (P2)
**Goal**: Implement PUT endpoint

**Tasks**:
1. Implement PUT `/api/{user_id}/tasks/{id}` endpoint
   - Validate ownership before update
   - Update title and description
   - Preserve completed status
   - Auto-update updated_at timestamp
   - Return 200 with updated task
2. Add validation for empty title
3. Write integration tests for update scenarios
4. Test partial updates (only title, only description)

**Validation**: Can update tasks, timestamps update correctly, ownership enforced

### Phase 2.5: User Story 4 - Task Deletion (P2)
**Goal**: Implement DELETE endpoint

**Tasks**:
1. Implement DELETE `/api/{user_id}/tasks/{id}` endpoint
   - Validate ownership before delete
   - Delete task from database
   - Return 204 No Content
2. Handle idempotent deletes (404 on already-deleted)
3. Write integration tests for deletion
4. Test ownership enforcement

**Validation**: Can delete tasks, idempotent behavior works, ownership enforced

### Phase 2.6: User Story 5 - Toggle Completion (P2)
**Goal**: Implement PATCH toggle endpoint

**Tasks**:
1. Implement PATCH `/api/{user_id}/tasks/{id}/complete` endpoint
   - Validate ownership
   - Toggle completed status (true ↔ false)
   - Update updated_at timestamp
   - Return 200 with updated task
2. Write integration tests for toggle behavior
3. Test that other fields remain unchanged

**Validation**: Can toggle completion status, toggle works both directions

### Phase 2.7: User Story 7 - Migrations (P3)
**Goal**: Document migration workflow and create rollback tests

**Tasks**:
1. Document migration creation process in quickstart.md
2. Test migration rollback with `alembic downgrade -1`
3. Create migration for adding index on user_id (if not in initial)
4. Verify migration history with `alembic history`

**Validation**: Migrations apply and rollback successfully

### Phase 2.8: User Story 8 - Performance Testing (P3)
**Goal**: Validate connection pooling under load

**Tasks**:
1. Write load test script with 50 concurrent requests
2. Monitor connection pool metrics
3. Verify no "too many connections" errors
4. Measure p95 latency (target <200ms)
5. Test connection recycling after idle period

**Validation**: System handles concurrent load, meets performance targets

### Phase 2.9: Integration Testing & Documentation
**Goal**: Comprehensive testing and final documentation

**Tasks**:
1. Write integration tests for all 6 endpoints
2. Test all error scenarios (401, 404, 422, 503)
3. Test user isolation across all endpoints
4. Update API documentation with examples
5. Create troubleshooting guide for common issues
6. Verify constitution compliance (all principles)

**Validation**: 100% endpoint coverage, all tests pass, documentation complete

## Dependencies & Execution Order

### Critical Path
1. **Phase 2.1 (Database Foundation)** → BLOCKS all other phases
2. **Phase 2.2 (US1 - Create/List)** → MVP functionality
3. **Phase 2.3 (US2 - Get Single)** → Required for update/delete verification
4. **Phases 2.4-2.6 (US3-US5)** → Can proceed in parallel after 2.3
5. **Phases 2.7-2.8 (US7-US8)** → Can proceed in parallel, lower priority
6. **Phase 2.9 (Testing)** → Final validation after all features complete

### Parallel Opportunities
- After Phase 2.3 complete: US3 (Update), US4 (Delete), US5 (Toggle) can be implemented in parallel
- US7 (Migrations) and US8 (Performance) can be done in parallel
- Integration tests can be written alongside feature implementation

### External Dependencies
- **Spec 1 (Authentication & Security Layer)**: MUST be complete before starting
  - Requires: `get_current_user()` dependency
  - Requires: `verify_user_access()` dependency
  - Requires: JWT token verification middleware
- **Neon PostgreSQL**: Database must be provisioned and accessible
- **Frontend Integration**: Separate spec (not a blocker for backend implementation)

## Risk Analysis

### Risk 1: Async SQLModel Complexity
- **Impact**: Medium - Developers unfamiliar with async patterns may struggle
- **Mitigation**: Comprehensive research.md with code examples, test fixtures demonstrating patterns
- **Fallback**: Use synchronous SQLModel (performance penalty but simpler)

### Risk 2: Alembic Migration Conflicts
- **Impact**: Low - Multiple developers creating migrations simultaneously
- **Mitigation**: Single developer implements database layer, clear migration naming convention
- **Fallback**: Manual migration merge with Alembic conflict resolution

### Risk 3: Connection Pool Exhaustion
- **Impact**: High - Could cause 503 errors under load
- **Mitigation**: Conservative pool settings (max_size=20), load testing in Phase 2.8
- **Fallback**: Increase pool size or implement request queuing

### Risk 4: User Isolation Bugs
- **Impact**: Critical - Data leakage between users
- **Mitigation**: Defense-in-depth (middleware + query-level filtering), comprehensive integration tests
- **Fallback**: Code review focusing on WHERE clauses, security audit

### Risk 5: Timestamp Inconsistencies
- **Impact**: Low - updated_at not updating correctly
- **Mitigation**: Use SQLAlchemy onupdate with func.now(), test timestamp behavior
- **Fallback**: Manual timestamp updates in each endpoint

## Estimated Timeline

**Total**: 3-4 hours for complete implementation

- **Phase 0 (Research)**: 30 minutes
- **Phase 1 (Design)**: 30 minutes
- **Phase 2.1 (Database Foundation)**: 45 minutes
- **Phase 2.2 (US1 - Create/List)**: 30 minutes
- **Phase 2.3 (US2 - Get Single)**: 15 minutes
- **Phase 2.4 (US3 - Update)**: 20 minutes
- **Phase 2.5 (US4 - Delete)**: 15 minutes
- **Phase 2.6 (US5 - Toggle)**: 15 minutes
- **Phase 2.7 (US7 - Migrations)**: 20 minutes
- **Phase 2.8 (US8 - Performance)**: 20 minutes
- **Phase 2.9 (Testing & Docs)**: 30 minutes

**Note**: Timeline assumes Spec 1 (Authentication) is already complete and developer is familiar with FastAPI and SQLModel basics.

## Success Metrics

- ✅ All 6 endpoints return correct HTTP status codes (200, 201, 204, 404, 422)
- ✅ Database schema deployed with all constraints verified
- ✅ 100% user isolation enforcement (verified by tests)
- ✅ Connection pool handles 50 concurrent requests without errors
- ✅ Task operations complete in <200ms at p95 latency
- ✅ Alembic migrations apply and rollback successfully
- ✅ Integration tests achieve 100% endpoint coverage
- ✅ All constitution principles verified (IV, V, VI)

## Next Steps

1. Run `/sp.tasks` to generate detailed task breakdown with acceptance criteria
2. Implement Phase 2.1 (Database Foundation) - BLOCKING for all other work
3. Implement Phase 2.2 (US1 - MVP) - First user-facing functionality
4. Continue with remaining user stories in priority order (P1 → P2 → P3)
5. Run integration tests after each phase
6. Deploy to staging environment for end-to-end testing
