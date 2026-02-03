# Feature Specification: Backend API & Database Layer

**Feature Branch**: `002-backend-api-database-layer`
**Created**: 2026-01-29
**Status**: Draft
**Input**: User description: "Project: Todo Full-Stack Web Application — Spec 2: Backend API & Database Layer"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Task Creation and Retrieval (Priority: P1) 🎯 MVP

As a developer integrating with the backend API, I need to create new tasks and retrieve all tasks for a user so that the frontend can display the user's todo list.

**Why this priority**: Core CRUD functionality - without the ability to create and retrieve tasks, the application has no value. This is the foundation for all other operations.

**Independent Test**: Can be fully tested by POSTing a new task to `/api/{user_id}/tasks` with valid data, then GETting `/api/{user_id}/tasks` to verify the task appears in the list. Delivers immediate value by allowing users to create and view their tasks.

**Acceptance Scenarios**:

1. **Given** a valid JWT token and user_id, **When** I POST to `/api/{user_id}/tasks` with `{"title": "Buy groceries", "description": "Milk, eggs, bread"}`, **Then** I receive 201 Created with the task object including auto-generated `id`, `created_at`, `updated_at`, and `completed: false`

2. **Given** a user has 3 tasks in the database, **When** I GET `/api/{user_id}/tasks`, **Then** I receive 200 OK with an array of 3 task objects, all belonging to that user

3. **Given** a valid JWT token, **When** I POST to `/api/{user_id}/tasks` with missing `title` field, **Then** I receive 422 Unprocessable Entity with validation error message "Field required: title"

4. **Given** user A has 5 tasks and user B has 3 tasks, **When** user A calls GET `/api/{user_id}/tasks`, **Then** they receive only their 5 tasks (user isolation enforced)

---

### User Story 2 - Single Task Retrieval (Priority: P1)

As a developer, I need to retrieve a specific task by ID so that the frontend can display task details or verify task creation.

**Why this priority**: Essential for verifying task creation and displaying individual task details. Required for update and delete operations to confirm the target task.

**Independent Test**: Can be tested by creating a task via POST, capturing the returned `id`, then GETting `/api/{user_id}/tasks/{id}` to retrieve that specific task.

**Acceptance Scenarios**:

1. **Given** a task with id `123e4567-e89b-12d3-a456-426614174000` exists for user A, **When** user A calls GET `/api/{user_id}/tasks/123e4567-e89b-12d3-a456-426614174000`, **Then** they receive 200 OK with the task object

2. **Given** a task belongs to user A, **When** user B attempts to GET `/api/{user_id}/tasks/{task_id}` with user B's user_id, **Then** they receive 404 Not Found (ownership enforcement)

3. **Given** a task ID that doesn't exist, **When** I GET `/api/{user_id}/tasks/nonexistent-id`, **Then** I receive 404 Not Found with message "Task not found"

4. **Given** an invalid UUID format, **When** I GET `/api/{user_id}/tasks/invalid-uuid`, **Then** I receive 422 Unprocessable Entity with validation error

---

### User Story 3 - Task Update (Priority: P2)

As a developer, I need to update task title and description so that users can edit their tasks after creation.

**Why this priority**: Important for user experience but not critical for MVP. Users can create new tasks if editing isn't available initially.

**Independent Test**: Can be tested by creating a task, then PUTting to `/api/{user_id}/tasks/{id}` with updated data, then GETting the task to verify changes persisted.

**Acceptance Scenarios**:

1. **Given** a task with title "Buy groceries", **When** I PUT to `/api/{user_id}/tasks/{id}` with `{"title": "Buy organic groceries", "description": "Whole Foods"}`, **Then** I receive 200 OK with updated task and `updated_at` timestamp is newer than `created_at`

2. **Given** a task belongs to user A, **When** user B attempts to PUT `/api/{user_id}/tasks/{task_id}`, **Then** they receive 404 Not Found (ownership enforcement)

3. **Given** a valid task, **When** I PUT with empty title `{"title": ""}`, **Then** I receive 422 Unprocessable Entity with validation error "Title cannot be empty"

4. **Given** a task with `completed: true`, **When** I PUT with new title, **Then** the `completed` status is preserved (partial update doesn't reset other fields)

---

### User Story 4 - Task Deletion (Priority: P2)

As a developer, I need to delete tasks so that users can remove completed or unwanted tasks from their list.

**Why this priority**: Important for task management but not critical for initial MVP. Users can leave tasks uncompleted if deletion isn't available.

**Independent Test**: Can be tested by creating a task, then DELETEing `/api/{user_id}/tasks/{id}`, then attempting to GET the same task to verify 404 response.

**Acceptance Scenarios**:

1. **Given** a task exists, **When** I DELETE `/api/{user_id}/tasks/{id}`, **Then** I receive 204 No Content and subsequent GET requests return 404

2. **Given** a task belongs to user A, **When** user B attempts to DELETE `/api/{user_id}/tasks/{task_id}`, **Then** they receive 404 Not Found (ownership enforcement)

3. **Given** a task ID that doesn't exist, **When** I DELETE `/api/{user_id}/tasks/nonexistent-id`, **Then** I receive 404 Not Found

4. **Given** a task is deleted, **When** I attempt to DELETE the same task again, **Then** I receive 404 Not Found (idempotency consideration)

---

### User Story 5 - Toggle Task Completion (Priority: P2)

As a developer, I need to toggle task completion status so that users can mark tasks as done or undone without a full update.

**Why this priority**: Enhances user experience with a dedicated endpoint for the most common operation, but full update (PUT) can achieve the same result.

**Independent Test**: Can be tested by creating a task with `completed: false`, then PATCHing `/api/{user_id}/tasks/{id}/complete` to toggle to `true`, then PATCHing again to toggle back to `false`.

**Acceptance Scenarios**:

1. **Given** a task with `completed: false`, **When** I PATCH `/api/{user_id}/tasks/{id}/complete`, **Then** I receive 200 OK with task object showing `completed: true` and updated `updated_at` timestamp

2. **Given** a task with `completed: true`, **When** I PATCH `/api/{user_id}/tasks/{id}/complete`, **Then** I receive 200 OK with task object showing `completed: false` (toggle behavior)

3. **Given** a task belongs to user A, **When** user B attempts to PATCH `/api/{user_id}/tasks/{task_id}/complete`, **Then** they receive 404 Not Found (ownership enforcement)

4. **Given** a task is toggled to completed, **When** I GET the task, **Then** the `title` and `description` remain unchanged (only completion status affected)

---

### User Story 6 - Database Schema and Constraints (Priority: P1)

As a backend developer, I need a properly designed database schema with constraints so that data integrity is enforced at the database level.

**Why this priority**: Critical foundation - without proper schema design, data corruption and integrity issues will occur. Must be in place before any API operations.

**Independent Test**: Can be tested by attempting to insert invalid data directly into the database (e.g., NULL user_id, duplicate IDs, invalid foreign keys) and verifying constraints prevent it.

**Acceptance Scenarios**:

1. **Given** the database is initialized, **When** I inspect the `tasks` table schema, **Then** I see columns: `id` (UUID, PRIMARY KEY), `user_id` (UUID, FOREIGN KEY to users.id, NOT NULL), `title` (VARCHAR, NOT NULL), `description` (TEXT, NULLABLE), `completed` (BOOLEAN, DEFAULT false), `created_at` (TIMESTAMP, NOT NULL), `updated_at` (TIMESTAMP, NOT NULL)

2. **Given** the schema is deployed, **When** I attempt to INSERT a task with NULL `user_id`, **Then** the database rejects it with constraint violation error

3. **Given** a user is deleted from the `users` table, **When** I query tasks for that user_id, **Then** the foreign key constraint prevents orphaned tasks (or cascades delete based on configuration)

4. **Given** the schema includes indexes, **When** I query tasks by `user_id`, **Then** the query uses the index for optimal performance (verified via EXPLAIN ANALYZE)

---

### User Story 7 - Database Migrations with Alembic (Priority: P3)

As a backend developer, I need version-controlled database migrations so that schema changes can be tracked, reviewed, and rolled back if needed.

**Why this priority**: Important for production deployments and team collaboration, but not critical for initial development. Schema can be created manually for MVP.

**Independent Test**: Can be tested by running `alembic upgrade head` to apply migrations, verifying schema matches expected state, then running `alembic downgrade -1` to rollback and verify schema reverts.

**Acceptance Scenarios**:

1. **Given** Alembic is configured, **When** I run `alembic upgrade head`, **Then** all migrations apply successfully and the `tasks` table is created with correct schema

2. **Given** a migration adds a new column, **When** I run `alembic upgrade head`, **Then** the column is added without data loss and existing rows have default values

3. **Given** a migration is applied, **When** I run `alembic downgrade -1`, **Then** the migration is rolled back and schema returns to previous state

4. **Given** multiple developers create migrations, **When** migrations are merged, **Then** Alembic detects conflicts and prevents applying incompatible changes

---

### User Story 8 - Connection Pooling and Performance (Priority: P3)

As a backend developer, I need proper database connection pooling so that the application can handle concurrent requests without connection exhaustion.

**Why this priority**: Important for production scalability but not critical for initial development. Single connection works for MVP testing.

**Independent Test**: Can be tested by simulating 50 concurrent API requests and verifying all complete successfully without "too many connections" errors, and monitoring connection pool metrics.

**Acceptance Scenarios**:

1. **Given** connection pool is configured with max_size=20, **When** 50 concurrent requests arrive, **Then** requests queue and complete successfully without connection errors

2. **Given** a database query takes 5 seconds, **When** 10 concurrent requests arrive, **Then** connections are reused after queries complete (pool recycling)

3. **Given** a connection becomes stale, **When** the pool attempts to use it, **Then** the connection is automatically recycled (pool_pre_ping=True)

4. **Given** the application is idle for 10 minutes, **When** a new request arrives, **Then** the connection pool maintains minimum connections and responds without delay

---

### Edge Cases

- **What happens when a task title exceeds 500 characters?** System returns 422 with validation error "Title must be 500 characters or less"
- **What happens when user_id in URL doesn't match JWT token?** System returns 403 Forbidden (handled by authentication layer, but API should verify)
- **What happens when database connection is lost mid-request?** System returns 503 Service Unavailable and logs error for monitoring
- **What happens when two requests try to update the same task simultaneously?** Last write wins (optimistic concurrency - no locking for MVP)
- **What happens when description is NULL vs empty string?** Both are valid - NULL means no description provided, empty string means explicitly cleared
- **What happens when created_at and updated_at are manually set in POST request?** System ignores client-provided timestamps and uses server-generated values
- **What happens when a task is created with completed: true?** Valid - user can create already-completed tasks
- **What happens when DELETE is called on already-deleted task?** Returns 404 (idempotent behavior)
- **What happens when database migration fails halfway?** Alembic transaction rolls back, schema remains in previous consistent state
- **What happens when connection pool is exhausted?** New requests wait in queue up to timeout (30 seconds), then return 503

## Requirements *(mandatory)*

### Functional Requirements

#### API Endpoints

- **FR-001**: System MUST provide GET `/api/{user_id}/tasks` endpoint that returns all tasks for authenticated user as JSON array
- **FR-002**: System MUST provide POST `/api/{user_id}/tasks` endpoint that creates a new task and returns 201 Created with task object
- **FR-003**: System MUST provide GET `/api/{user_id}/tasks/{id}` endpoint that returns a single task by ID or 404 if not found
- **FR-004**: System MUST provide PUT `/api/{user_id}/tasks/{id}` endpoint that updates task title and description, returning 200 OK with updated task
- **FR-005**: System MUST provide DELETE `/api/{user_id}/tasks/{id}` endpoint that removes a task, returning 204 No Content
- **FR-006**: System MUST provide PATCH `/api/{user_id}/tasks/{id}/complete` endpoint that toggles task completion status, returning 200 OK with updated task

#### Data Model

- **FR-007**: Task model MUST include fields: `id` (UUID), `user_id` (UUID), `title` (string, max 500 chars), `description` (string, optional), `completed` (boolean), `created_at` (datetime), `updated_at` (datetime)
- **FR-008**: System MUST auto-generate `id` as UUID v4 for new tasks
- **FR-009**: System MUST auto-generate `created_at` timestamp when task is created
- **FR-010**: System MUST auto-update `updated_at` timestamp whenever task is modified
- **FR-011**: System MUST default `completed` to `false` for new tasks
- **FR-012**: System MUST enforce `title` as required field (NOT NULL constraint)
- **FR-013**: System MUST allow `description` to be NULL or empty string

#### Database Schema

- **FR-014**: Database MUST have `tasks` table with PRIMARY KEY on `id` column
- **FR-015**: Database MUST have FOREIGN KEY constraint from `tasks.user_id` to `users.id`
- **FR-016**: Database MUST have INDEX on `tasks.user_id` for query performance
- **FR-017**: Database MUST have NOT NULL constraints on `id`, `user_id`, `title`, `completed`, `created_at`, `updated_at`
- **FR-018**: Database MUST use PostgreSQL UUID type for `id` and `user_id` columns
- **FR-019**: Database MUST use TIMESTAMP WITH TIME ZONE for `created_at` and `updated_at`

#### User Isolation

- **FR-020**: All GET `/api/{user_id}/tasks` queries MUST filter by authenticated user_id: `WHERE user_id = <token_user_id>`
- **FR-021**: All POST `/api/{user_id}/tasks` operations MUST set `user_id` to authenticated user_id (ignore URL parameter)
- **FR-022**: All GET `/api/{user_id}/tasks/{id}` queries MUST verify task belongs to authenticated user
- **FR-023**: All PUT `/api/{user_id}/tasks/{id}` operations MUST verify task belongs to authenticated user
- **FR-024**: All DELETE `/api/{user_id}/tasks/{id}` operations MUST verify task belongs to authenticated user
- **FR-025**: All PATCH `/api/{user_id}/tasks/{id}/complete` operations MUST verify task belongs to authenticated user

#### Validation and Error Handling

- **FR-026**: System MUST return 422 Unprocessable Entity when `title` is missing or empty
- **FR-027**: System MUST return 422 Unprocessable Entity when `title` exceeds 500 characters
- **FR-028**: System MUST return 422 Unprocessable Entity when `id` or `user_id` is not valid UUID format
- **FR-029**: System MUST return 404 Not Found when task doesn't exist or doesn't belong to authenticated user
- **FR-030**: System MUST return 404 Not Found (not 403) for unauthorized access to prevent task enumeration
- **FR-031**: System MUST return validation error messages in format: `{"detail": [{"loc": ["body", "title"], "msg": "Field required", "type": "value_error.missing"}]}`
- **FR-032**: System MUST return 503 Service Unavailable when database connection fails

#### Database Connection

- **FR-033**: System MUST use asyncpg driver for PostgreSQL connections
- **FR-034**: System MUST configure connection pool with min_size=5, max_size=20
- **FR-035**: System MUST enable pool_pre_ping=True to detect stale connections
- **FR-036**: System MUST load DATABASE_URL from environment variable (never hardcoded)
- **FR-037**: System MUST use SQLModel async session for all database operations

#### Migrations

- **FR-038**: System MUST use Alembic for database schema migrations
- **FR-039**: System MUST version-control all migration files in `backend/alembic/versions/`
- **FR-040**: System MUST include both upgrade and downgrade functions in each migration
- **FR-041**: System MUST apply migrations via `alembic upgrade head` command
- **FR-042**: System MUST support rollback via `alembic downgrade -1` command

### Key Entities

- **Task**: Represents a todo item with title, optional description, completion status, and ownership. Belongs to exactly one user. Includes auto-managed timestamps for creation and last update tracking.

- **User** (referenced): Represents an authenticated user who owns tasks. Defined in authentication layer (Spec 1). Tasks reference users via foreign key constraint.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 API endpoints (GET list, POST create, GET single, PUT update, DELETE, PATCH toggle) return correct HTTP status codes (200, 201, 204, 404, 422) for valid and invalid requests
- **SC-002**: Database schema is deployed to Neon PostgreSQL with all constraints (PRIMARY KEY, FOREIGN KEY, NOT NULL, INDEX) verified via schema inspection
- **SC-003**: 100% of database queries filter by authenticated user_id - verified by code review and integration tests showing user A cannot access user B's tasks
- **SC-004**: Connection pool handles 50 concurrent requests without "too many connections" errors - verified via load testing
- **SC-005**: All validation errors return clear, actionable messages in standardized format - verified by testing invalid inputs (missing title, invalid UUID, etc.)
- **SC-006**: Task creation and retrieval completes in under 200ms at p95 latency - verified via performance testing
- **SC-007**: Alembic migrations apply successfully with `alembic upgrade head` and rollback successfully with `alembic downgrade -1` - verified by running migration commands
- **SC-008**: Integration tests achieve 100% coverage of all 6 endpoints with positive and negative test cases
- **SC-009**: Database foreign key constraint prevents orphaned tasks when user is deleted - verified by attempting to delete user with tasks
- **SC-010**: Auto-generated timestamps (created_at, updated_at) are accurate to within 1 second of server time - verified by comparing returned timestamps with server clock

### Technical Validation

- **TV-001**: SQLModel schema definition matches deployed database schema (verified via `alembic check`)
- **TV-002**: All async endpoints use `async def` and `await` for database operations (verified via code review)
- **TV-003**: No SQL injection vulnerabilities (verified via parameterized queries and SQLModel ORM usage)
- **TV-004**: Database connection pool metrics show healthy recycling (no connection leaks) after 1000 requests
- **TV-005**: Error responses never expose internal implementation details (stack traces, SQL queries, file paths)

## Constitution Compliance

This specification adheres to the following constitution principles:

- **Principle IV (User Data Isolation)**: All endpoints enforce user ownership at query level with `WHERE user_id = <token_user_id>`
- **Principle V (Configuration Reproducibility)**: DATABASE_URL loaded from environment variables, connection pooling parameters documented
- **Principle VI (API Security Standards)**: Consistent status codes (404 for not found/unauthorized, 422 for validation errors, 503 for service errors)

## Dependencies

- **Spec 1 (Authentication & Security Layer)**: This spec assumes JWT authentication is implemented and `get_current_user()` dependency is available to extract authenticated user_id from tokens
- **Neon PostgreSQL**: Requires active Neon database with connection string configured in environment variables
- **SQLModel**: Requires SQLModel library for ORM and schema definition
- **Alembic**: Requires Alembic for database migrations
- **asyncpg**: Requires asyncpg driver for async PostgreSQL connections

## Out of Scope

- Task categories, tags, or labels
- Task priority levels (high, medium, low)
- Due dates, reminders, or scheduling
- Task sharing or collaboration between users
- Soft deletes (deleted_at timestamps)
- Full-text search on task title/description
- Pagination or filtering (beyond user_id)
- Sorting options (by date, title, completion)
- Task attachments or file uploads
- Audit logs for task changes
- Bulk operations (delete all, complete all)
- GraphQL API (REST only)
- Task archiving or history
- Task templates or recurring tasks
- Task dependencies or subtasks
- Real-time updates via WebSockets
- Task export (CSV, JSON)

## Notes

- This specification focuses purely on backend API and database layer
- Authentication and authorization are handled by Spec 1 (Authentication & Security Layer)
- Frontend integration is handled by separate frontend specification
- All endpoints assume JWT token is validated by authentication middleware before reaching endpoint handlers
- User isolation is enforced at both middleware level (user_id validation) and query level (WHERE clause) for defense-in-depth
