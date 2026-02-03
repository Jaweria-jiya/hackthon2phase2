# Implementation Plan: Authentication & Security Layer

**Branch**: `001-auth-security-layer` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/auth-security-layer/spec.md`

## Summary

Implement secure user authentication using Better Auth (Next.js frontend) with JWT token issuance and FastAPI (Python backend) with JWT verification middleware. The system enforces stateless authentication where JWT tokens are issued on login, transported via Authorization headers, verified using a shared secret, and used to enforce user data isolation at both the authorization and database query levels.

**Primary Requirement**: Enable users to signup, signin, and access protected API endpoints with JWT-based authentication, ensuring each user can only access their own tasks.

**Technical Approach**:
- Frontend: Better Auth library with JWT plugin for token issuance
- Backend: FastAPI dependency injection with python-jose for token verification
- Security: HS256 symmetric signing with shared BETTER_AUTH_SECRET
- Isolation: Database queries filter by authenticated user_id extracted from JWT sub claim

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x with Next.js 16+ (App Router)
- Backend: Python 3.11+

**Primary Dependencies**:
- Frontend: `better-auth` (authentication library with JWT plugin)
- Backend: `fastapi`, `python-jose[cryptography]` (JWT verification), `bcrypt` or `argon2-cffi` (password hashing), `sqlmodel` (ORM)

**Storage**:
- Neon Serverless PostgreSQL
- Tables: `users` (id, email, password_hash, created_at), `tasks` (id, user_id, title, description, completed, created_at, updated_at)

**Testing**:
- Frontend: Jest + React Testing Library
- Backend: pytest with pytest-asyncio
- Integration: End-to-end tests for complete auth flow

**Target Platform**:
- Frontend: Web browsers (Chrome, Firefox, Safari, Edge)
- Backend: Linux server (containerized deployment)

**Project Type**: Web application (separate frontend and backend services)

**Performance Goals**:
- JWT verification: <50ms per request
- Signup/signin: <2 seconds response time
- Concurrent authentication: 100 requests/second without degradation

**Constraints**:
- JWT token expiry: 7 days (604800 seconds)
- Password hashing: bcrypt cost factor 12 minimum
- Token transport: Authorization header only (no query params)
- Shared secret: minimum 32 characters, cryptographically random
- No server-side session storage (stateless authentication)

**Scale/Scope**:
- Initial: 100-1000 users
- API endpoints: 8 total (2 public auth endpoints, 6 protected task endpoints)
- Authentication flows: 2 (signup, signin)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Security-First Authentication
✅ **PASS**: Passwords hashed with bcrypt (cost 12), JWT tokens signed with HS256, zero-trust verification on every request

### Principle II: JWT Token Management
✅ **PASS**: Better Auth issues tokens with sub/email/iat/exp claims, FastAPI verifies with shared BETTER_AUTH_SECRET, tokens transported via Authorization header

### Principle III: Authentication vs Authorization Separation
✅ **PASS**: Better Auth handles identity verification (signup/signin), FastAPI handles access control (token verification, user_id validation)

### Principle IV: User Data Isolation
✅ **PASS**: All database queries filter by authenticated user_id: `WHERE user_id = <token_user_id>`, defense-in-depth at query level

### Principle V: Configuration Reproducibility
✅ **PASS**: All secrets in .env files, setup documented with `openssl rand -base64 32` for secret generation, both services use identical BETTER_AUTH_SECRET

### Principle VI: API Security Standards
✅ **PASS**: Consistent error codes (401 for invalid/missing tokens, 403 for user_id mismatch, 404 for non-existent resources), no sensitive information in errors

**Overall Gate Status**: ✅ **PASS** - All constitution principles satisfied, no violations to justify

## Project Structure

### Documentation (this feature)

```text
specs/auth-security-layer/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (technology research)
├── data-model.md        # Phase 1 output (database schema)
├── quickstart.md        # Phase 1 output (setup guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── openapi.yaml     # OpenAPI specification for auth endpoints
└── tasks.md             # Phase 2 output (created by /sp.tasks command)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)

backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entry point
│   ├── config.py                  # Environment configuration
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── jwt.py                 # JWT verification logic
│   │   └── dependencies.py        # FastAPI dependencies (get_current_user, verify_user_access)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                # User SQLModel
│   │   └── task.py                # Task SQLModel
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py                # Auth endpoints (signup, signin)
│   │   └── tasks.py               # Task endpoints (CRUD operations)
│   └── database.py                # Database connection and session management
├── tests/
│   ├── __init__.py
│   ├── conftest.py                # Pytest fixtures
│   ├── test_auth.py               # Auth flow tests
│   ├── test_jwt.py                # JWT verification tests
│   └── test_tasks.py              # Task endpoint tests
├── requirements.txt               # Python dependencies
└── .env.example                   # Environment variable template

frontend/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── signup/
│   │   └── page.tsx               # Signup page
│   ├── login/
│   │   └── page.tsx               # Login page
│   ├── dashboard/
│   │   └── page.tsx               # Protected dashboard (task list)
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts       # Better Auth API route handler
├── components/
│   ├── auth/
│   │   ├── SignupForm.tsx         # Signup form component
│   │   └── LoginForm.tsx          # Login form component
│   ├── tasks/
│   │   ├── TaskList.tsx           # Task list component
│   │   ├── TaskItem.tsx           # Individual task component
│   │   └── TaskForm.tsx           # Create/edit task form
│   └── ui/
│       ├── Button.tsx             # Reusable button component
│       └── Input.tsx              # Reusable input component
├── lib/
│   ├── auth.ts                    # Better Auth configuration
│   ├── api-client.ts              # API client with JWT interceptor
│   └── auth-context.tsx           # Auth context provider
├── types/
│   ├── auth.ts                    # Auth-related TypeScript types
│   └── task.ts                    # Task-related TypeScript types
├── tests/
│   ├── auth.test.tsx              # Auth component tests
│   └── api-client.test.ts        # API client tests
├── package.json                   # Node dependencies
├── tsconfig.json                  # TypeScript configuration
├── next.config.js                 # Next.js configuration
└── .env.local.example             # Environment variable template
```

**Structure Decision**: Web application structure selected because the feature requires separate frontend (Next.js) and backend (FastAPI) services. Frontend handles UI and Better Auth integration for token issuance. Backend handles API logic and JWT verification for authorization. This separation aligns with Principle III (Authentication vs Authorization Separation) and enables independent scaling and deployment.

## Complexity Tracking

> **No violations detected - this section is empty**

All constitution principles are satisfied without requiring complexity justifications.

---

## Implementation Phases

### Phase 0: Research & Technology Validation

**Goal**: Validate technology choices and resolve any unknowns before implementation

**Research Tasks**:

1. **Better Auth JWT Plugin Configuration**
   - Research: How to enable JWT plugin in Better Auth
   - Research: JWT token payload customization (adding custom claims)
   - Research: Token expiry configuration (7-day setting)
   - Output: Document Better Auth configuration in research.md

2. **FastAPI JWT Verification Best Practices**
   - Research: python-jose vs PyJWT library comparison
   - Research: FastAPI dependency injection patterns for auth
   - Research: Error handling for expired/invalid tokens
   - Output: Document JWT verification approach in research.md

3. **Shared Secret Management**
   - Research: Secure secret generation methods
   - Research: Environment variable best practices for secrets
   - Research: Secret rotation strategies (future consideration)
   - Output: Document secret management in research.md

4. **Database Schema for Authentication**
   - Research: User table design (UUID vs integer IDs)
   - Research: Password hash storage (bcrypt vs argon2)
   - Research: Index strategy for user lookups
   - Output: Document schema decisions in research.md

**Deliverables**:
- `research.md` with all technology decisions documented
- No remaining "NEEDS CLARIFICATION" items in Technical Context

**Estimated Time**: 1 hour

---

### Phase 1: Design & Contracts

**Goal**: Define data models, API contracts, and setup documentation

**Tasks**:

1. **Create data-model.md**
   - Define User entity (id, email, password_hash, created_at)
   - Define Task entity (id, user_id, title, description, completed, created_at, updated_at)
   - Document relationships (User 1:N Tasks)
   - Document validation rules (email format, password strength)
   - Document indexes (users.email unique, tasks.user_id)

2. **Create API contracts (contracts/openapi.yaml)**
   - Document auth endpoints:
     - POST /api/auth/signup (request: email, password; response: user_id, token)
     - POST /api/auth/login (request: email, password; response: user_id, token)
   - Document task endpoints:
     - GET /api/{user_id}/tasks (response: array of tasks)
     - POST /api/{user_id}/tasks (request: title, description; response: task)
     - GET /api/{user_id}/tasks/{id} (response: task)
     - PUT /api/{user_id}/tasks/{id} (request: title, description, completed; response: task)
     - DELETE /api/{user_id}/tasks/{id} (response: 204 No Content)
     - PATCH /api/{user_id}/tasks/{id}/complete (response: task)
   - Document authentication requirements (Authorization: Bearer header)
   - Document error responses (401, 403, 404, 422)

3. **Create quickstart.md**
   - Document environment setup steps
   - Document secret generation: `openssl rand -base64 32`
   - Document dependency installation (npm install, pip install)
   - Document database setup (Neon connection)
   - Document running both services (npm run dev, uvicorn)

**Deliverables**:
- `data-model.md` with complete entity definitions
- `contracts/openapi.yaml` with all API endpoints documented
- `quickstart.md` with reproducible setup instructions

**Estimated Time**: 1.5 hours

---

### Phase 2: Environment Setup

**Goal**: Configure shared secret and install dependencies

**Agent**: All agents (coordination required)

**Tasks**:

1. **Generate Shared Secret**
   ```bash
   openssl rand -base64 32
   ```
   - Store output for use in both .env files

2. **Frontend Environment Configuration**
   - Create `frontend/.env.local`:
     ```
     BETTER_AUTH_SECRET=<generated-secret>
     NEXT_PUBLIC_API_URL=http://localhost:4000
     ```
   - Create `frontend/.env.local.example` (with placeholder values)

3. **Backend Environment Configuration**
   - Create `backend/.env`:
     ```
     BETTER_AUTH_SECRET=<same-generated-secret>
     DATABASE_URL=postgresql://user:pass@neon-host/dbname
     CORS_ORIGINS=http://localhost:3000
     ```
   - Create `backend/.env.example` (with placeholder values)

4. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install better-auth
   ```

5. **Install Backend Dependencies**
   ```bash
   cd backend
   pip install "python-jose[cryptography]" python-multipart bcrypt sqlmodel
   ```

**Validation**:
- ✅ Both services can read `BETTER_AUTH_SECRET` from environment
- ✅ Dependencies install without errors
- ✅ Secrets match exactly between frontend and backend

**Estimated Time**: 30 minutes

---

### Phase 3: Better Auth Configuration (Frontend)

**Goal**: Enable JWT plugin and create auth API routes

**Agent**: Frontend-Agent + Auth-Agent

**Tasks**:

1. **Create Better Auth Configuration** (`lib/auth.ts`)
   ```typescript
   import { betterAuth } from "better-auth"
   import { jwt } from "better-auth/plugins"

   export const auth = betterAuth({
     secret: process.env.BETTER_AUTH_SECRET!,
     database: {
       // Neon PostgreSQL connection
       provider: "postgresql",
       url: process.env.DATABASE_URL!
     },
     emailAndPassword: {
       enabled: true,
       minPasswordLength: 8
     },
     plugins: [
       jwt({
         expiresIn: "7d", // 7 days = 604800 seconds
         algorithm: "HS256"
       })
     ]
   })
   ```

2. **Create API Route Handler** (`app/api/auth/[...all]/route.ts`)
   ```typescript
   import { auth } from "@/lib/auth"
   import { toNextJsHandler } from "better-auth/next-js"

   export const { GET, POST } = toNextJsHandler(auth)
   ```

3. **Create Auth Context Provider** (`lib/auth-context.tsx`)
   - Wrap app with auth provider
   - Expose `useAuth()` hook for components
   - Provide `user`, `signIn`, `signUp`, `signOut` methods

4. **Create Signup Page** (`app/signup/page.tsx`)
   - Form with email and password inputs
   - Client-side validation (email format, password length)
   - Call Better Auth signup endpoint
   - Redirect to dashboard on success

5. **Create Login Page** (`app/login/page.tsx`)
   - Form with email and password inputs
   - Call Better Auth login endpoint
   - Store JWT token in httpOnly cookie
   - Redirect to dashboard on success

**Validation**:
- ✅ `/api/auth/signup` endpoint accepts POST requests
- ✅ `/api/auth/signin` returns JWT token in response
- ✅ Token payload contains `sub` (user_id), `email`, `iat`, `exp`
- ✅ Token expiry is set to 7 days from issuance

**Estimated Time**: 1 hour

---

### Phase 4: Frontend API Client

**Goal**: Attach JWT token to all API requests

**Agent**: Frontend-Agent

**Tasks**:

1. **Create API Client Utility** (`lib/api-client.ts`)
   ```typescript
   import { auth } from "./auth"

   export async function apiClient(endpoint: string, options: RequestInit = {}) {
     const session = await auth.api.getSession()
     const token = session?.token

     const headers = {
       "Content-Type": "application/json",
       ...(token && { Authorization: `Bearer ${token}` }),
       ...options.headers
     }

     const response = await fetch(
       `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
       { ...options, headers }
     )

     if (response.status === 401) {
       // Token expired or invalid - redirect to login
       window.location.href = "/login"
       throw new Error("Unauthorized")
     }

     return response
   }
   ```

2. **Create API Service Functions** (`lib/api/tasks.ts`)
   - `getTasks(userId: string)` - GET /api/{user_id}/tasks
   - `createTask(userId: string, data)` - POST /api/{user_id}/tasks
   - `updateTask(userId, taskId, data)` - PUT /api/{user_id}/tasks/{id}
   - `deleteTask(userId, taskId)` - DELETE /api/{user_id}/tasks/{id}
   - `toggleComplete(userId, taskId)` - PATCH /api/{user_id}/tasks/{id}/complete

3. **Add Error Handling**
   - Handle 401 (redirect to login)
   - Handle 403 (show "Access denied" message)
   - Handle 404 (show "Not found" message)
   - Handle network errors (show "Connection failed" message)

**Validation**:
- ✅ API requests include Authorization header when user is logged in
- ✅ Requests without token do not include header
- ✅ Token is correctly formatted: `Bearer eyJhbGc...`
- ✅ 401 responses trigger redirect to login page

**Estimated Time**: 45 minutes

---

### Phase 5: FastAPI JWT Middleware (Backend)

**Goal**: Verify JWT and extract user identity

**Agent**: Backend-Agent + Auth-Agent

**Tasks**:

1. **Create JWT Verification Module** (`app/auth/jwt.py`)
   ```python
   from jose import JWTError, jwt
   from datetime import datetime
   from app.config import settings

   def verify_token(token: str) -> dict:
       """Verify JWT token and return payload"""
       try:
           payload = jwt.decode(
               token,
               settings.BETTER_AUTH_SECRET,
               algorithms=["HS256"]
           )

           # Check expiration
           exp = payload.get("exp")
           if exp and datetime.fromtimestamp(exp) < datetime.now():
               raise JWTError("Token expired")

           return payload
       except JWTError as e:
           raise ValueError(f"Invalid token: {str(e)}")
   ```

2. **Create FastAPI Dependencies** (`app/auth/dependencies.py`)
   ```python
   from fastapi import Depends, HTTPException, status
   from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
   from app.auth.jwt import verify_token

   security = HTTPBearer()

   async def get_current_user(
       credentials: HTTPAuthorizationCredentials = Depends(security)
   ) -> str:
       """Extract and verify JWT token, return user_id"""
       try:
           token = credentials.credentials
           payload = verify_token(token)
           user_id = payload.get("sub")

           if not user_id:
               raise HTTPException(
                   status_code=status.HTTP_401_UNAUTHORIZED,
                   detail="Invalid token: missing user_id"
               )

           return user_id
       except ValueError as e:
           raise HTTPException(
               status_code=status.HTTP_401_UNAUTHORIZED,
               detail=str(e)
           )

   def verify_user_access(
       user_id: str,
       current_user: str = Depends(get_current_user)
   ):
       """Verify URL user_id matches authenticated user_id"""
       if user_id != current_user:
           raise HTTPException(
               status_code=status.HTTP_403_FORBIDDEN,
               detail="Access denied: user_id mismatch"
           )
   ```

3. **Create Configuration Module** (`app/config.py`)
   ```python
   from pydantic_settings import BaseSettings

   class Settings(BaseSettings):
       BETTER_AUTH_SECRET: str
       DATABASE_URL: str
       CORS_ORIGINS: str = "http://localhost:3000"

       class Config:
           env_file = ".env"

   settings = Settings()
   ```

**Validation**:
- ✅ Valid token successfully decodes to user_id
- ✅ Expired token raises 401 error
- ✅ Invalid signature raises 401 error
- ✅ Token with wrong secret raises 401 error
- ✅ user_id mismatch raises 403 error

**Estimated Time**: 1.5 hours

---

### Phase 6: Protect API Endpoints (Backend)

**Goal**: Enforce authentication on all task routes

**Agent**: Backend-Agent

**Tasks**:

1. **Update Task Endpoints** (`app/api/tasks.py`)
   ```python
   from fastapi import APIRouter, Depends, HTTPException, status
   from sqlmodel import Session, select
   from app.auth.dependencies import get_current_user, verify_user_access
   from app.models.task import Task
   from app.database import get_session

   router = APIRouter()

   @router.get("/api/{user_id}/tasks")
   async def get_tasks(
       user_id: str,
       current_user: str = Depends(get_current_user),
       _: None = Depends(verify_user_access),
       session: Session = Depends(get_session)
   ):
       """Get all tasks for authenticated user"""
       # Filter by authenticated user_id (defense-in-depth)
       tasks = session.exec(
           select(Task).where(Task.user_id == current_user)
       ).all()
       return tasks

   @router.post("/api/{user_id}/tasks")
   async def create_task(
       user_id: str,
       task_data: TaskCreate,
       current_user: str = Depends(get_current_user),
       _: None = Depends(verify_user_access),
       session: Session = Depends(get_session)
   ):
       """Create new task for authenticated user"""
       task = Task(**task_data.dict(), user_id=current_user)
       session.add(task)
       session.commit()
       session.refresh(task)
       return task

   # Similar pattern for PUT, DELETE, PATCH endpoints
   ```

2. **Add Database Query Filtering**
   - All queries MUST include `WHERE user_id = current_user`
   - Never trust URL user_id parameter for queries
   - Use authenticated user_id from JWT token

3. **Add Error Handling**
   - 401 for missing/invalid tokens
   - 403 for user_id mismatch
   - 404 for non-existent resources (don't reveal if resource exists for other users)
   - 422 for validation errors

**Validation**:
- ✅ Authenticated user can access their own tasks
- ✅ Authenticated user cannot access other users' tasks (403)
- ✅ Unauthenticated request returns 401
- ✅ Invalid token returns 401
- ✅ All database queries filter by authenticated user_id

**Estimated Time**: 1 hour

---

### Phase 7: Integration Testing

**Goal**: Verify end-to-end authentication flow

**Agent**: Backend-Agent + Frontend-Agent

**Test Scenarios**:

1. **Signup Flow**
   - Create new user via Better Auth
   - Verify user record exists in database
   - Verify password is hashed (not plaintext)
   - Verify JWT token is returned

2. **Signin Flow**
   - Login with valid credentials
   - Receive JWT token
   - Decode token manually to verify payload (sub, email, iat, exp)
   - Verify token expiry is 7 days from now

3. **Authenticated API Access**
   - Create task for user A
   - Fetch tasks as user A (success)
   - Try to fetch tasks as user B using user A's token (403)
   - Verify only user A's tasks are returned

4. **Unauthenticated Access**
   - Call API without token (401)
   - Call API with expired token (401)
   - Call API with malformed token (401)
   - Call API with tampered token (401)

5. **User Isolation**
   - Create 5 tasks for user A
   - Create 3 tasks for user B
   - Verify user A sees only their 5 tasks
   - Verify user B sees only their 3 tasks
   - Attempt cross-user access (all return 403)

6. **Token Expiry**
   - Create token with 1-second expiry (test mode)
   - Wait 2 seconds
   - Attempt to use expired token (401)
   - Verify error message: "Token expired"

**Validation**:
- ✅ All test scenarios pass
- ✅ No user can access another user's data
- ✅ Token expiry is enforced
- ✅ Error codes are consistent (401, 403, 404)

**Estimated Time**: 1 hour

---

### Phase 8: Documentation

**Goal**: Document configuration and usage

**Agent**: All agents (documentation)

**Tasks**:

1. **Create Setup Guide** (`docs/auth-setup.md`)
   - How to generate `BETTER_AUTH_SECRET`: `openssl rand -base64 32`
   - Environment variable setup for frontend (.env.local)
   - Environment variable setup for backend (.env)
   - Better Auth configuration options (token expiry, algorithm)
   - Database setup (Neon connection string)
   - Dependency installation (npm, pip)

2. **Create API Authentication Guide** (`docs/api-authentication.md`)
   - How to obtain JWT token (signup/signin)
   - How to attach token to requests (Authorization header)
   - Token format: `Bearer <token>`
   - Common error codes and solutions:
     - 401: Missing or invalid token → Login again
     - 403: Access denied → Check user_id in URL
     - 404: Resource not found → Verify resource exists
   - Token expiry handling (7 days)

3. **Add Inline Code Comments**
   - JWT verification logic (`app/auth/jwt.py`)
   - User access checks (`app/auth/dependencies.py`)
   - Token extraction (`lib/api-client.ts`)
   - Better Auth configuration (`lib/auth.ts`)

4. **Update README.md**
   - Add authentication section
   - Link to setup and API guides
   - Add troubleshooting section

**Validation**:
- ✅ Another developer can set up auth using docs alone
- ✅ All configuration steps are reproducible
- ✅ Common errors are documented with solutions

**Estimated Time**: 30 minutes

---

## Estimated Total Time: 7.5 hours

**Breakdown**:
- Phase 0 (Research): 1 hour
- Phase 1 (Design): 1.5 hours
- Phase 2 (Environment): 30 minutes
- Phase 3 (Better Auth): 1 hour
- Phase 4 (API Client): 45 minutes
- Phase 5 (JWT Middleware): 1.5 hours
- Phase 6 (Protect Endpoints): 1 hour
- Phase 7 (Integration Testing): 1 hour
- Phase 8 (Documentation): 30 minutes

## Dependencies

**External**:
- Neon PostgreSQL database configured with connection string
- Next.js 16+ project structure initialized
- FastAPI project structure initialized
- Node.js 18+ and Python 3.11+ installed

**Internal**:
- Database schema must be created before Phase 6 (Backend-Agent)
- Better Auth configuration must be complete before Phase 4 (Frontend-Agent)
- JWT middleware must be complete before Phase 6 (Backend-Agent)

**Agent Coordination**:
- Database-Agent: Create users and tasks tables (prerequisite for all phases)
- Auth-Agent: Configure Better Auth and JWT verification (Phases 3, 5)
- Frontend-Agent: Build UI and API client (Phases 3, 4)
- Backend-Agent: Build API endpoints and middleware (Phases 5, 6)

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Secret mismatch between frontend and backend** | High - All authentication fails | Medium | Add health check endpoint to verify JWT verification works; document setup process clearly with copy-paste instructions |
| **Token expiry too long (7 days)** | Medium - Stolen tokens valid for extended period | Low | Document that 7 days is configurable; recommend shorter expiry for high-security applications; add note about token refresh in future |
| **CORS issues** | Medium - Frontend cannot call backend API | Medium | Configure CORS explicitly in FastAPI with frontend origin; test cross-origin requests early |
| **Database query missing user_id filter** | Critical - Data leakage across users | Low | Code review checklist for all queries; integration tests for cross-user access attempts; use ORM query builder to enforce filters |
| **JWT library incompatibility** | Medium - Token verification fails | Low | Use python-jose (recommended by FastAPI docs); test token verification in Phase 5 before proceeding |
| **Timing attacks on login endpoint** | Low - Email enumeration possible | Low | Ensure consistent response time for invalid email vs invalid password; use constant-time comparison for password verification |

## Deliverables

**Phase 0**:
- ✅ `research.md` with technology decisions

**Phase 1**:
- ✅ `data-model.md` with entity definitions
- ✅ `contracts/openapi.yaml` with API specification
- ✅ `quickstart.md` with setup instructions

**Phase 2-8**:
- ✅ Working Better Auth signup/signin pages
- ✅ JWT token issued on login with correct claims
- ✅ FastAPI middleware verifying JWT on all protected endpoints
- ✅ All API endpoints protected and enforcing user isolation
- ✅ Integration tests passing (100% coverage of auth flows)
- ✅ Documentation for setup and usage

**Final Validation**:
- ✅ Users can signup and signin successfully
- ✅ JWT tokens are issued with 7-day expiry
- ✅ All protected endpoints reject requests without valid tokens (401)
- ✅ Cross-user access attempts are blocked (403)
- ✅ Database queries filter by authenticated user_id
- ✅ Configuration is reproducible via .env files
- ✅ No plaintext passwords in database
- ✅ Error messages don't leak sensitive information

## Next Steps

1. **Execute Phase 0**: Run research tasks to validate technology choices
2. **Execute Phase 1**: Create data models, API contracts, and quickstart guide
3. **Generate Tasks** (`/sp.tasks`): Break down phases into atomic, testable tasks for each agent
4. **Begin Implementation**: Execute tasks in dependency order (Database → Backend → Auth → Frontend)
5. **Integration Testing**: Verify end-to-end authentication flow
6. **Documentation Review**: Ensure setup is reproducible by another developer
