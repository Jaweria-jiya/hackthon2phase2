---
description: "Task list for Backend API & Database Layer implementation"
---

# Tasks: Backend API & Database Layer

**Input**: Design documents from `/specs/backend-api-database-layer/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/app/`, `frontend/app/` (not modified in this spec)
- Backend paths: `backend/app/models/`, `backend/app/api/`, `backend/alembic/`
- This spec focuses exclusively on backend API layer

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Update backend/requirements.txt to add asyncpg==0.29.0 and alembic==1.13.0
- [ ] T002 Install backend dependencies with pip install -r backend/requirements.txt
- [X] T003 Update backend/.env to change DATABASE_URL from postgresql:// to postgresql+asyncpg:// for async driver
- [X] T004 Update backend/.env.example to document postgresql+asyncpg:// format for async connections

---

## Phase 2: Foundational (Blocking Prerequisites) - User Story 6

**Purpose**: Core database infrastructure that MUST be complete before ANY API endpoint can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

This phase implements User Story 6 (Database Schema and Constraints) which is foundational for all other stories.

- [X] T005 Update backend/app/database.py to replace synchronous engine with create_async_engine from sqlalchemy.ext.asyncio
- [X] T006 Configure connection pool settings in backend/app/database.py (pool_size=5, max_overflow=15, pool_pre_ping=True, pool_recycle=3600)
- [X] T007 Update get_session() dependency in backend/app/database.py to use AsyncSession with async context manager
- [X] T008 Add create_db_and_tables() async function in backend/app/database.py for development table creation
- [X] T009 [P] [US6] Create backend/app/models/task.py with Task SQLModel including all 7 fields (id, user_id, title, description, completed, created_at, updated_at)
- [X] T010 [US6] Add PRIMARY KEY constraint on id field in Task model
- [X] T011 [US6] Add FOREIGN KEY constraint on user_id field referencing users.id in Task model
- [X] T012 [US6] Add INDEX on user_id field in Task model for query performance
- [X] T013 [US6] Add NOT NULL constraints on id, user_id, title, completed, created_at, updated_at fields in Task model
- [X] T014 [US6] Configure auto-updating updated_at timestamp using sa_column_kwargs with onupdate=func.now() in Task model
- [X] T015 [US6] Update backend/app/models/__init__.py to export Task model
- [X] T016 [P] Initialize Alembic in backend directory with alembic init alembic command
- [X] T017 Configure backend/alembic.ini to leave sqlalchemy.url empty (will use DATABASE_URL from .env)
- [X] T018 Update backend/alembic/env.py to import SQLModel.metadata and set as target_metadata
- [X] T019 Update backend/alembic/env.py to configure async engine using DATABASE_URL from environment
- [X] T020 Update backend/alembic/env.py to implement run_migrations_online() with async connection handling
- [X] T021 Create initial Alembic migration with alembic revision --autogenerate -m "Add tasks table"
- [X] T022 Review generated migration file in backend/alembic/versions/ to verify all columns, constraints, and indexes
- [X] T023 Apply migration to Neon database with alembic upgrade head
- [X] T024 Verify database schema by connecting to Neon and inspecting tasks table structure

**Checkpoint**: Foundation ready - Task model exists, database schema deployed, migrations working. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Task Creation and Retrieval (Priority: P1) 🎯 MVP

**Goal**: Enable creating new tasks and retrieving all tasks for a user so the frontend can display the user's todo list.

**Independent Test**: POST a new task to /api/{user_id}/tasks with valid data, then GET /api/{user_id}/tasks to verify the task appears in the list. Delivers immediate value by allowing users to create and view their tasks.

### Implementation for User Story 1

- [X] T025 [P] [US1] Create backend/app/api/tasks.py with FastAPI router initialization (prefix="/api", tags=["tasks"])
- [X] T026 [P] [US1] Create TaskCreate Pydantic model in backend/app/api/tasks.py with title (str) and description (Optional[str]) fields
- [X] T027 [US1] Implement POST /api/{user_id}/tasks endpoint in backend/app/api/tasks.py with get_current_user and verify_user_access dependencies
- [X] T028 [US1] Add request body validation in POST endpoint using TaskCreate model
- [X] T029 [US1] Create new Task instance in POST endpoint using user_id from JWT token (current_user), not URL parameter
- [X] T030 [US1] Add task to async session, commit, refresh, and return 201 Created with task object in POST endpoint
- [X] T031 [US1] Implement GET /api/{user_id}/tasks endpoint in backend/app/api/tasks.py with get_current_user and verify_user_access dependencies
- [X] T032 [US1] Add async query in GET list endpoint filtering by authenticated user_id: select(Task).where(Task.user_id == UUID(current_user))
- [X] T033 [US1] Return 200 OK with array of task objects from GET list endpoint
- [X] T034 [US1] Add error handling for missing title field in POST endpoint (return 422 with validation error)
- [X] T035 [US1] Add error handling for title exceeding 500 characters in POST endpoint (return 422 with validation error)
- [X] T036 [US1] Include tasks router in backend/app/main.py with app.include_router(tasks_router)
- [ ] T037 [US1] Test POST endpoint: Create task with valid data, verify 201 response with auto-generated id, timestamps, completed=false
- [ ] T038 [US1] Test GET list endpoint: Create 3 tasks for user A, verify GET returns all 3 tasks
- [ ] T039 [US1] Test user isolation: Create tasks for user A and user B, verify user A only sees their own tasks

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create tasks and retrieve their task list with proper user isolation.

---

## Phase 4: User Story 2 - Single Task Retrieval (Priority: P1)

**Goal**: Enable retrieving a specific task by ID so the frontend can display task details or verify task creation.

**Independent Test**: Create a task via POST, capture the returned id, then GET /api/{user_id}/tasks/{id} to retrieve that specific task.

### Implementation for User Story 2

- [X] T040 [US2] Implement GET /api/{user_id}/tasks/{id} endpoint in backend/app/api/tasks.py with get_current_user and verify_user_access dependencies
- [X] T041 [US2] Add async query in GET single endpoint with dual filters: Task.id == UUID(id) AND Task.user_id == UUID(current_user)
- [X] T042 [US2] Return 200 OK with task object if found in GET single endpoint
- [X] T043 [US2] Return 404 Not Found with message "Task not found" if task doesn't exist or doesn't belong to user
- [X] T044 [US2] Add UUID validation for id path parameter (return 422 for invalid UUID format)
- [ ] T045 [US2] Test GET single endpoint: Create task, retrieve by id, verify 200 response with correct task data
- [ ] T046 [US2] Test ownership enforcement: User A creates task, user B attempts to GET with user B's user_id, verify 404 response
- [ ] T047 [US2] Test non-existent task: GET with random UUID, verify 404 response
- [ ] T048 [US2] Test invalid UUID: GET with malformed id, verify 422 validation error

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can create, list, and retrieve individual tasks.

---

## Phase 5: User Story 3 - Task Update (Priority: P2)

**Goal**: Enable updating task title and description so users can edit their tasks after creation.

**Independent Test**: Create a task, then PUT to /api/{user_id}/tasks/{id} with updated data, then GET the task to verify changes persisted.

### Implementation for User Story 3

- [X] T049 [P] [US3] Create TaskUpdate Pydantic model in backend/app/api/tasks.py with title (str) and description (Optional[str]) fields
- [X] T050 [US3] Implement PUT /api/{user_id}/tasks/{id} endpoint in backend/app/api/tasks.py with get_current_user and verify_user_access dependencies
- [X] T051 [US3] Add async query in PUT endpoint to fetch task with dual filters: Task.id == UUID(id) AND Task.user_id == UUID(current_user)
- [X] T052 [US3] Return 404 Not Found if task doesn't exist or doesn't belong to user in PUT endpoint
- [X] T053 [US3] Update task.title and task.description from request body in PUT endpoint
- [X] T054 [US3] Preserve task.completed status (do not modify) in PUT endpoint
- [X] T055 [US3] Add updated task to session, commit, refresh, and return 200 OK with updated task object
- [X] T056 [US3] Verify updated_at timestamp is automatically updated by SQLAlchemy onupdate
- [X] T057 [US3] Add validation for empty title in PUT endpoint (return 422 with error message)
- [ ] T058 [US3] Test PUT endpoint: Update task title and description, verify 200 response with updated data and new updated_at timestamp
- [ ] T059 [US3] Test ownership enforcement: User A creates task, user B attempts to PUT, verify 404 response
- [ ] T060 [US3] Test partial update: Update only title, verify description remains unchanged
- [ ] T061 [US3] Test completed preservation: Update task with completed=true, verify completed status is preserved after PUT

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - users can create, retrieve, and update tasks.

---

## Phase 6: User Story 4 - Task Deletion (Priority: P2)

**Goal**: Enable deleting tasks so users can remove completed or unwanted tasks from their list.

**Independent Test**: Create a task, then DELETE /api/{user_id}/tasks/{id}, then attempt to GET the same task to verify 404 response.

### Implementation for User Story 4

- [X] T062 [US4] Implement DELETE /api/{user_id}/tasks/{id} endpoint in backend/app/api/tasks.py with get_current_user and verify_user_access dependencies
- [X] T063 [US4] Add async query in DELETE endpoint to fetch task with dual filters: Task.id == UUID(id) AND Task.user_id == UUID(current_user)
- [X] T064 [US4] Return 404 Not Found if task doesn't exist or doesn't belong to user in DELETE endpoint
- [X] T065 [US4] Delete task from session using await session.delete(task) in DELETE endpoint
- [X] T066 [US4] Commit deletion and return 204 No Content (empty response body) in DELETE endpoint
- [ ] T067 [US4] Test DELETE endpoint: Create task, delete it, verify 204 response
- [ ] T068 [US4] Test subsequent GET after delete: Verify 404 response for deleted task
- [ ] T069 [US4] Test ownership enforcement: User A creates task, user B attempts to DELETE, verify 404 response
- [ ] T070 [US4] Test idempotency: DELETE same task twice, verify second DELETE returns 404

**Checkpoint**: At this point, User Stories 1-4 should all work independently - users can create, retrieve, update, and delete tasks.

---

## Phase 7: User Story 5 - Toggle Task Completion (Priority: P2)

**Goal**: Enable toggling task completion status so users can mark tasks as done or undone without a full update.

**Independent Test**: Create a task with completed=false, then PATCH /api/{user_id}/tasks/{id}/complete to toggle to true, then PATCH again to toggle back to false.

### Implementation for User Story 5

- [X] T071 [US5] Implement PATCH /api/{user_id}/tasks/{id}/complete endpoint in backend/app/api/tasks.py with get_current_user and verify_user_access dependencies
- [X] T072 [US5] Add async query in PATCH endpoint to fetch task with dual filters: Task.id == UUID(id) AND Task.user_id == UUID(current_user)
- [X] T073 [US5] Return 404 Not Found if task doesn't exist or doesn't belong to user in PATCH endpoint
- [X] T074 [US5] Toggle task.completed status using task.completed = not task.completed in PATCH endpoint
- [X] T075 [US5] Add updated task to session, commit, refresh, and return 200 OK with updated task object
- [X] T076 [US5] Verify updated_at timestamp is automatically updated by SQLAlchemy onupdate
- [ ] T077 [US5] Test PATCH endpoint: Create task with completed=false, toggle to true, verify 200 response with completed=true
- [ ] T078 [US5] Test toggle behavior: PATCH again on same task, verify completed toggles back to false
- [ ] T079 [US5] Test field preservation: Toggle completion, verify title and description remain unchanged
- [ ] T080 [US5] Test ownership enforcement: User A creates task, user B attempts to PATCH, verify 404 response

**Checkpoint**: At this point, all core user stories (1-5) should be fully functional - complete CRUD operations with toggle completion.

---

## Phase 8: User Story 7 - Database Migrations with Alembic (Priority: P3)

**Goal**: Document migration workflow and verify rollback functionality so schema changes can be tracked, reviewed, and rolled back if needed.

**Independent Test**: Run alembic upgrade head to apply migrations, verify schema matches expected state, then run alembic downgrade -1 to rollback and verify schema reverts.

### Implementation for User Story 7

- [X] T081 [P] [US7] Document migration creation process in specs/backend-api-database-layer/quickstart.md (already done in Phase 1, verify completeness)
- [ ] T082 [US7] Test migration rollback: Run alembic downgrade -1 to rollback tasks table migration
- [ ] T083 [US7] Verify schema after rollback: Connect to Neon database and confirm tasks table no longer exists
- [ ] T084 [US7] Re-apply migration: Run alembic upgrade head to restore tasks table
- [ ] T085 [US7] Verify migration history: Run alembic history to display all applied migrations
- [ ] T086 [US7] Test migration conflict detection: Create dummy migration file with same revision ID, verify Alembic detects conflict
- [X] T087 [US7] Document rollback procedure in specs/backend-api-database-layer/quickstart.md with examples

**Checkpoint**: Migration workflow is documented and tested - developers can create, apply, and rollback migrations safely.

---

## Phase 9: User Story 8 - Connection Pooling and Performance (Priority: P3)

**Goal**: Validate connection pooling configuration so the application can handle concurrent requests without connection exhaustion.

**Independent Test**: Simulate 50 concurrent API requests and verify all complete successfully without "too many connections" errors, and monitor connection pool metrics.

### Implementation for User Story 8

- [ ] T088 [P] [US8] Create backend/tests/load_test.py script to simulate 50 concurrent POST requests to create tasks
- [ ] T089 [US8] Add connection pool monitoring to load test script to track pool size and overflow usage
- [ ] T090 [US8] Run load test and verify all 50 requests complete successfully without connection errors
- [ ] T091 [US8] Verify no "too many connections" errors in backend logs during load test
- [ ] T092 [US8] Measure p95 latency for task creation during load test (target <200ms)
- [ ] T093 [US8] Test connection recycling: Wait 10 minutes idle, then send request, verify connection pool maintains minimum connections
- [ ] T094 [US8] Test stale connection detection: Verify pool_pre_ping=True detects and recycles stale connections
- [ ] T095 [US8] Document connection pool settings and monitoring in specs/backend-api-database-layer/quickstart.md

**Checkpoint**: Connection pooling is validated under load - system meets performance targets and handles concurrent requests.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [X] T096 [P] Add inline code comments to backend/app/models/task.py explaining field constraints and relationships
- [X] T097 [P] Add inline code comments to backend/app/api/tasks.py explaining user isolation enforcement
- [X] T098 [P] Add inline code comments to backend/app/database.py explaining connection pool configuration
- [X] T099 [P] Update specs/backend-api-database-layer/quickstart.md with troubleshooting section for common issues
- [ ] T100 [P] Create backend/tests/test_user_isolation.py to verify user isolation across all 6 endpoints
- [ ] T101 Verify all 6 endpoints return correct HTTP status codes (200, 201, 204, 404, 422) for valid and invalid requests
- [ ] T102 Verify database schema includes all constraints (PRIMARY KEY, FOREIGN KEY, NOT NULL, INDEX) via schema inspection
- [ ] T103 Verify auto-generated timestamps (created_at, updated_at) are accurate to within 1 second of server time
- [ ] T104 Test all validation error scenarios: missing title, title too long, invalid UUID, empty title in update
- [ ] T105 Test all error responses return clear, actionable messages without leaking sensitive information
- [ ] T106 Verify constitution compliance: Principle IV (user isolation), Principle V (config reproducibility), Principle VI (API security standards)
- [ ] T107 Run complete end-to-end test: Signup → Login → Create task → List tasks → Get single → Update → Toggle → Delete
- [ ] T108 Update README.md with Backend API & Database Layer section linking to quickstart.md and API documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P2 → P2 → P2 → P3 → P3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Task Creation/Retrieval)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1 - Single Task Retrieval)**: Can start after Foundational (Phase 2) - Independent of US1 but logically follows it
- **User Story 3 (P2 - Task Update)**: Can start after Foundational (Phase 2) - Independent but requires US2 for testing (need to retrieve task to verify update)
- **User Story 4 (P2 - Task Deletion)**: Can start after Foundational (Phase 2) - Independent but requires US2 for testing (need to verify deletion)
- **User Story 5 (P2 - Toggle Completion)**: Can start after Foundational (Phase 2) - Independent but requires US2 for testing (need to verify toggle)
- **User Story 7 (P3 - Migrations)**: Can start after Foundational (Phase 2) - Independent, focuses on migration workflow
- **User Story 8 (P3 - Performance)**: Can start after Foundational (Phase 2) - Independent, focuses on load testing

### Within Each User Story

- Pydantic models before endpoint implementation
- Endpoint implementation before error handling
- Core functionality before edge case testing
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: T001, T003, T004 can run in parallel (different files)
- **Phase 2 (Foundational)**: T005-T008 (database.py updates), T009-T015 (Task model), T016-T020 (Alembic setup) can run in parallel
- **Phase 3 (US1)**: T025, T026 can run in parallel (router init vs Pydantic model)
- **Phase 5 (US3)**: T049 can run in parallel with other tasks (Pydantic model creation)
- **Phase 8 (US7)**: T081 can run in parallel with other tasks (documentation)
- **Phase 9 (US8)**: T088 can run in parallel with other tasks (load test script creation)
- **Phase 10 (Polish)**: T096, T097, T098, T099, T100 can all run in parallel (different files)
- **After Phase 2 complete**: US1, US2, US3, US4, US5, US7, US8 can all be implemented in parallel by different developers

---

## Parallel Example: User Story 1 (Task Creation and Retrieval)

```bash
# Launch backend tasks together:
Task T025: "Create backend/app/api/tasks.py with FastAPI router initialization"
Task T026: "Create TaskCreate Pydantic model in backend/app/api/tasks.py"

# These work on the same file but different sections, can be done in quick succession
```

---

## Parallel Example: Foundational Phase

```bash
# Launch database and model tasks together:
Task T005-T008: "Update backend/app/database.py with async engine and connection pooling"
Task T009-T015: "Create backend/app/models/task.py with Task SQLModel"
Task T016-T020: "Initialize and configure Alembic for migrations"

# These work on different files and can proceed simultaneously
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T024) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 - Task Creation/Retrieval (T025-T039)
4. Complete Phase 4: User Story 2 - Single Task Retrieval (T040-T048)
5. **STOP and VALIDATE**: Test US1 and US2 independently
6. Deploy/demo if ready - users can now create, list, and retrieve tasks

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo
3. Add User Story 2 → Test independently → Deploy/Demo (MVP!)
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 7 → Test independently → Deploy/Demo
8. Add User Story 8 → Test independently → Deploy/Demo
9. Add Polish (Phase 10) → Final deployment
10. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T024)
2. Once Foundational is done:
   - Developer A: User Story 1 (T025-T039)
   - Developer B: User Story 2 (T040-T048)
   - Developer C: User Story 3 (T049-T061)
3. After initial stories complete:
   - Developer A: User Story 4 (T062-T070)
   - Developer B: User Story 5 (T071-T080)
   - Developer C: User Story 7 (T081-T087)
4. Final phase:
   - Developer A: User Story 8 (T088-T095)
   - Developer B: Polish tasks (T096-T108)
5. Stories complete and integrate independently

---

## Task Summary

**Total Tasks**: 108

**Tasks per Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational - US6): 20 tasks (BLOCKING)
- Phase 3 (US1 - Task Creation/Retrieval): 15 tasks
- Phase 4 (US2 - Single Task Retrieval): 9 tasks
- Phase 5 (US3 - Task Update): 13 tasks
- Phase 6 (US4 - Task Deletion): 9 tasks
- Phase 7 (US5 - Toggle Completion): 10 tasks
- Phase 8 (US7 - Migrations): 7 tasks
- Phase 9 (US8 - Performance): 8 tasks
- Phase 10 (Polish): 13 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel with other tasks

**Independent Test Criteria**:
- US1: POST task, GET list, verify task appears
- US2: POST task, GET by id, verify correct task returned
- US3: POST task, PUT with updates, GET to verify changes
- US4: POST task, DELETE, GET to verify 404
- US5: POST task, PATCH to toggle, verify completed status changes
- US6: Inspect database schema, verify all constraints present
- US7: Run alembic upgrade/downgrade, verify schema changes
- US8: Run 50 concurrent requests, verify no connection errors

**Suggested MVP Scope**: User Stories 1 & 2 (Task Creation/Retrieval + Single Task Retrieval) = 24 tasks after foundational phase

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Foundational phase (Phase 2) is CRITICAL and blocks all user story work
- Tests are NOT included as they were not explicitly requested in the specification
- All tasks include exact file paths for clarity
- Constitution compliance verified in Phase 10 (T106)
