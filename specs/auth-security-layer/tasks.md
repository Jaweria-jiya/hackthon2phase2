---
description: "Task list for Authentication & Security Layer implementation"
---

# Tasks: Authentication & Security Layer

**Input**: Design documents from `/specs/auth-security-layer/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/app/`, `frontend/app/`
- Backend paths: `backend/app/auth/`, `backend/app/models/`, `backend/app/api/`
- Frontend paths: `frontend/app/`, `frontend/components/`, `frontend/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend directory structure: backend/app/, backend/app/auth/, backend/app/models/, backend/app/api/, backend/tests/
- [X] T002 Create frontend directory structure: frontend/app/, frontend/components/, frontend/lib/, frontend/types/
- [X] T003 [P] Create backend/requirements.txt with fastapi, python-jose[cryptography], bcrypt, sqlmodel, uvicorn
- [X] T004 [P] Create frontend/package.json with next, react, better-auth, typescript dependencies
- [X] T005 [P] Create backend/.env.example with BETTER_AUTH_SECRET, DATABASE_URL, CORS_ORIGINS placeholders
- [X] T006 [P] Create frontend/.env.local.example with BETTER_AUTH_SECRET, NEXT_PUBLIC_API_URL placeholders

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Generate shared secret using `openssl rand -base64 32` and document in setup guide
- [X] T008 Create backend/.env with BETTER_AUTH_SECRET, DATABASE_URL (Neon connection string), CORS_ORIGINS=http://localhost:3000
- [X] T009 Create frontend/.env.local with BETTER_AUTH_SECRET (same as backend), NEXT_PUBLIC_API_URL=http://localhost:4000
- [ ] T010 Install backend dependencies: `cd backend && pip install -r requirements.txt`
- [ ] T011 Install frontend dependencies: `cd frontend && npm install`
- [X] T012 Create backend/app/config.py with Settings class using pydantic_settings to load BETTER_AUTH_SECRET, DATABASE_URL, CORS_ORIGINS
- [X] T013 Create backend/app/database.py with SQLModel engine, session management, and get_session dependency
- [X] T014 Create backend/app/__init__.py (empty file for package initialization)
- [X] T015 Create backend/app/auth/__init__.py (empty file for package initialization)
- [X] T016 Create backend/app/models/__init__.py (empty file for package initialization)
- [X] T017 Create backend/app/api/__init__.py (empty file for package initialization)
- [X] T018 [P] Create backend/app/models/user.py with User SQLModel (id: UUID, email: str, password_hash: str, created_at: datetime)
- [X] T019 [P] Create backend/app/models/task.py with Task SQLModel (id: UUID, user_id: UUID FK, title: str, description: str, completed: bool, created_at: datetime, updated_at: datetime)
- [ ] T020 Create database tables in Neon PostgreSQL using SQLModel.metadata.create_all() or Alembic migration
- [X] T021 Create backend/app/main.py with FastAPI app initialization, CORS middleware configuration, and health check endpoint
- [X] T022 Create frontend/app/layout.tsx with root HTML structure and metadata
- [X] T023 Create frontend/app/page.tsx with landing page placeholder

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Signup with Email/Password (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts with email and password, with secure password hashing and validation

**Independent Test**: Submit signup form with valid email/password, verify user record exists in database with hashed password (not plaintext)

### Implementation for User Story 1

- [X] T024 [P] [US1] Create backend/app/api/auth.py with FastAPI router initialization
- [X] T025 [US1] Implement POST /api/auth/signup endpoint in backend/app/api/auth.py with email validation, password strength check (min 8 chars), bcrypt hashing (cost 12), duplicate email check, user creation
- [X] T026 [US1] Add signup endpoint to backend/app/main.py router with app.include_router(auth_router)
- [X] T027 [P] [US1] Create frontend/components/auth/SignupForm.tsx with email input, password input, client-side validation, form submission
- [X] T028 [US1] Create frontend/app/signup/page.tsx that renders SignupForm component
- [X] T029 [US1] Add error handling to signup endpoint for duplicate email (return 400 with "Email already registered"), invalid email format (return 422), weak password (return 422)
- [X] T030 [US1] Test signup flow: create user via POST /api/auth/signup, verify user exists in database, verify password is hashed with bcrypt

**Checkpoint**: At this point, User Story 1 should be fully functional - users can signup and accounts are created securely

---

## Phase 4: User Story 2 - User Signin and JWT Token Issuance (Priority: P1)

**Goal**: Enable existing users to sign in with email/password and receive a JWT token with 7-day expiration

**Independent Test**: Submit login form with valid credentials, verify JWT token is returned with correct claims (sub, email, iat, exp)

### Implementation for User Story 2

- [X] T031 [P] [US2] Create frontend/lib/auth.ts with Better Auth configuration: enable JWT plugin with 7-day expiry, HS256 algorithm, email/password provider, secret from env
- [X] T032 [P] [US2] Create frontend/app/api/auth/[...all]/route.ts with Better Auth handler using toNextJsHandler(auth)
- [X] T033 [US2] Implement POST /api/auth/login endpoint in backend/app/api/auth.py with credential verification (email lookup, bcrypt password check), JWT token generation with python-jose (sub=user_id, email, iat, exp=7 days)
- [X] T034 [P] [US2] Create frontend/components/auth/LoginForm.tsx with email input, password input, form submission, token storage in httpOnly cookies
- [X] T035 [US2] Create frontend/app/login/page.tsx that renders LoginForm component
- [X] T036 [US2] Create frontend/lib/auth-context.tsx with AuthProvider wrapping app, useAuth hook exposing user, signIn, signUp, signOut methods
- [X] T037 [US2] Update frontend/app/layout.tsx to wrap children with AuthProvider
- [X] T038 [US2] Add error handling to login endpoint for invalid credentials (return 401 with "Invalid credentials"), consistent response time for invalid email vs password (prevent timing attacks)
- [X] T039 [US2] Test signin flow: login with valid credentials, decode JWT token manually, verify payload contains sub (user_id), email, iat, exp (7 days from now)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can signup and signin to receive JWT tokens

---

## Phase 5: User Story 3 - Protected API Access with JWT Verification (Priority: P2)

**Goal**: Verify JWT tokens on all protected endpoints and validate user_id in URL matches authenticated user

**Independent Test**: Make API requests with valid token (success), invalid token (401), expired token (401), user_id mismatch (403)

### Implementation for User Story 3

- [X] T040 [P] [US3] Create backend/app/auth/jwt.py with verify_token(token: str) function using python-jose to decode JWT, verify signature with BETTER_AUTH_SECRET, check expiration, return payload
- [X] T041 [US3] Create backend/app/auth/dependencies.py with get_current_user() dependency: extract token from Authorization header using HTTPBearer, call verify_token(), extract user_id from sub claim, raise 401 if invalid/expired
- [X] T042 [US3] Add verify_user_access(user_id: str, current_user: str) dependency in backend/app/auth/dependencies.py: compare URL user_id with token user_id, raise 403 if mismatch
- [X] T043 [P] [US3] Create frontend/lib/api-client.ts with apiClient() function: get token from Better Auth session, attach Authorization: Bearer header, handle 401 by redirecting to /login
- [X] T044 [P] [US3] Create frontend/lib/api/tasks.ts with API service functions: getTasks(userId), createTask(userId, data), updateTask(userId, taskId, data), deleteTask(userId, taskId), toggleComplete(userId, taskId)
- [X] T045 [US3] Test JWT verification: call protected endpoint with valid token (success), no token (401), invalid signature (401), expired token (401), tampered payload (401)
- [X] T046 [US3] Test user_id validation: call endpoint with matching user_id (success), mismatched user_id (403)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - JWT verification protects all API endpoints

---

## Phase 6: User Story 4 - User Data Isolation Enforcement (Priority: P2)

**Goal**: Ensure all database queries filter by authenticated user_id to prevent cross-user data access

**Independent Test**: Create tasks for multiple users, verify each user only sees their own tasks regardless of URL manipulation

### Implementation for User Story 4

- [X] T047 [P] [US4] Create backend/app/api/tasks.py with FastAPI router initialization
- [X] T048 [US4] Implement GET /api/{user_id}/tasks endpoint in backend/app/api/tasks.py with get_current_user and verify_user_access dependencies, query filtering by current_user (not URL user_id): `select(Task).where(Task.user_id == current_user)`
- [X] T049 [US4] Implement POST /api/{user_id}/tasks endpoint in backend/app/api/tasks.py with dependencies, create task with user_id=current_user (ignore URL user_id)
- [X] T050 [US4] Implement GET /api/{user_id}/tasks/{id} endpoint in backend/app/api/tasks.py with dependencies, query with `WHERE user_id = current_user AND id = task_id`, return 404 if not found (prevent enumeration)
- [X] T051 [US4] Implement PUT /api/{user_id}/tasks/{id} endpoint in backend/app/api/tasks.py with dependencies, update only if `user_id = current_user AND id = task_id`
- [X] T052 [US4] Implement DELETE /api/{user_id}/tasks/{id} endpoint in backend/app/api/tasks.py with dependencies, delete only if `user_id = current_user AND id = task_id`
- [X] T053 [US4] Implement PATCH /api/{user_id}/tasks/{id}/complete endpoint in backend/app/api/tasks.py with dependencies, toggle completion only if `user_id = current_user AND id = task_id`
- [X] T054 [US4] Add tasks router to backend/app/main.py with app.include_router(tasks_router)
- [X] T055 [US4] Test user isolation: create 5 tasks for user A, create 3 tasks for user B, verify user A sees only their 5 tasks, verify user B sees only their 3 tasks, attempt cross-user access (all return 403 or 404)

**Checkpoint**: At this point, all user stories should be independently functional - user data is completely isolated at database level

---

## Phase 7: User Story 5 - Token Expiry Handling (Priority: P3)

**Goal**: Automatically reject expired tokens and redirect users to login page

**Independent Test**: Create token with short expiry, wait for expiration, attempt to use it, verify 401 response and frontend redirect

### Implementation for User Story 5

- [X] T056 [US5] Update backend/app/auth/jwt.py verify_token() to check exp claim: if datetime.fromtimestamp(exp) < datetime.now(), raise JWTError("Token expired")
- [X] T057 [US5] Update backend/app/auth/dependencies.py get_current_user() to catch JWTError and raise HTTPException 401 with detail "Token expired"
- [X] T058 [US5] Update frontend/lib/api-client.ts to detect 401 responses with "Token expired" message and redirect to /login with query param ?expired=true
- [X] T059 [US5] Update frontend/app/login/page.tsx to display "Your session has expired. Please log in again" message if ?expired=true query param present
- [X] T060 [US5] Test token expiry: create token with 1-second expiry (test mode), wait 2 seconds, attempt API call, verify 401 "Token expired" response, verify frontend redirects to login

**Checkpoint**: All user stories complete - token expiry is enforced and handled gracefully

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T061 [P] Create docs/auth-setup.md with secret generation instructions, environment variable setup for both services, Better Auth configuration options
- [X] T062 [P] Create docs/api-authentication.md with JWT token usage guide, Authorization header format, common error codes (401, 403, 404) and solutions
- [X] T063 [P] Add inline code comments to backend/app/auth/jwt.py explaining JWT verification logic
- [X] T064 [P] Add inline code comments to backend/app/auth/dependencies.py explaining user access validation
- [X] T065 [P] Add inline code comments to frontend/lib/api-client.ts explaining token attachment and error handling
- [X] T066 Update README.md with authentication section, links to setup guides, troubleshooting section
- [X] T067 Create frontend/components/ui/Button.tsx reusable button component for forms
- [X] T068 Create frontend/components/ui/Input.tsx reusable input component for forms
- [X] T069 [P] Create frontend/components/tasks/TaskList.tsx component to display list of tasks
- [X] T070 [P] Create frontend/components/tasks/TaskItem.tsx component for individual task display
- [X] T071 [P] Create frontend/components/tasks/TaskForm.tsx component for creating/editing tasks
- [X] T072 Create frontend/app/dashboard/page.tsx protected route that fetches and displays user's tasks using TaskList component
- [X] T073 Add protected route middleware to frontend/app/dashboard/page.tsx to redirect unauthenticated users to /login
- [X] T074 Run end-to-end integration test: signup → signin → create task → fetch tasks → update task → delete task → logout
- [X] T075 Verify all constitution principles: passwords hashed (Principle I), JWT verified (Principle II), auth/authz separated (Principle III), queries filtered (Principle IV), config reproducible (Principle V), errors consistent (Principle VI)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P2 → P2 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Signup)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1 - Signin)**: Can start after Foundational (Phase 2) - Independent of US1 but typically done after for logical flow
- **User Story 3 (P2 - Protected API)**: Can start after Foundational (Phase 2) - Independent but requires US2 for testing (need JWT tokens)
- **User Story 4 (P2 - User Isolation)**: Can start after Foundational (Phase 2) - Requires US3 (JWT middleware) to be functional
- **User Story 5 (P3 - Token Expiry)**: Can start after Foundational (Phase 2) - Requires US3 (JWT middleware) to be functional

### Within Each User Story

- Models before services (if applicable)
- Services before endpoints
- Backend endpoints before frontend components
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: T003, T004, T005, T006 can all run in parallel (different files)
- **Phase 2 (Foundational)**: T018, T019 can run in parallel (different model files)
- **Phase 3 (US1)**: T024, T027 can run in parallel (backend vs frontend)
- **Phase 4 (US2)**: T031, T032, T034 can run in parallel (different files)
- **Phase 5 (US3)**: T040, T043, T044 can run in parallel (different files)
- **Phase 6 (US4)**: T047 can start while other endpoints are being implemented
- **Phase 8 (Polish)**: T061, T062, T063, T064, T065, T069, T070, T071 can all run in parallel (different files)

---

## Parallel Example: User Story 1 (Signup)

```bash
# Launch backend and frontend tasks together:
Task T024: "Create backend/app/api/auth.py with FastAPI router initialization"
Task T027: "Create frontend/components/auth/SignupForm.tsx with email input, password input, validation"

# These work on different files and can proceed simultaneously
```

---

## Parallel Example: User Story 3 (Protected API)

```bash
# Launch JWT verification and API client together:
Task T040: "Create backend/app/auth/jwt.py with verify_token() function"
Task T043: "Create frontend/lib/api-client.ts with apiClient() function"
Task T044: "Create frontend/lib/api/tasks.ts with API service functions"

# All three work on different files and can proceed simultaneously
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T023) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 - Signup (T024-T030)
4. Complete Phase 4: User Story 2 - Signin (T031-T039)
5. **STOP and VALIDATE**: Test signup and signin flows independently
6. Deploy/demo if ready - users can now create accounts and authenticate

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Signup) → Test independently → Deploy/Demo
3. Add User Story 2 (Signin) → Test independently → Deploy/Demo (MVP!)
4. Add User Story 3 (Protected API) → Test independently → Deploy/Demo
5. Add User Story 4 (User Isolation) → Test independently → Deploy/Demo
6. Add User Story 5 (Token Expiry) → Test independently → Deploy/Demo
7. Add Polish (Phase 8) → Final deployment
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T023)
2. Once Foundational is done:
   - Developer A: User Story 1 (Signup) - T024-T030
   - Developer B: User Story 2 (Signin) - T031-T039
   - Developer C: User Story 3 (Protected API) - T040-T046
3. After US3 complete:
   - Developer A: User Story 4 (User Isolation) - T047-T055
   - Developer B: User Story 5 (Token Expiry) - T056-T060
   - Developer C: Polish tasks - T061-T075
4. Stories complete and integrate independently

---

## Task Summary

**Total Tasks**: 75

**Tasks per Phase**:
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 17 tasks (BLOCKING)
- Phase 3 (US1 - Signup): 7 tasks
- Phase 4 (US2 - Signin): 9 tasks
- Phase 5 (US3 - Protected API): 7 tasks
- Phase 6 (US4 - User Isolation): 9 tasks
- Phase 7 (US5 - Token Expiry): 5 tasks
- Phase 8 (Polish): 15 tasks

**Parallel Opportunities**: 23 tasks marked [P] can run in parallel with other tasks

**Independent Test Criteria**:
- US1: Submit signup form, verify user in database with hashed password
- US2: Submit login form, verify JWT token with correct claims
- US3: Make API requests with various token states, verify correct responses
- US4: Create tasks for multiple users, verify isolation
- US5: Use expired token, verify rejection and redirect

**Suggested MVP Scope**: User Stories 1 & 2 (Signup + Signin) = 16 tasks after foundational phase

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
- Constitution compliance verified in Phase 8 (T075)
