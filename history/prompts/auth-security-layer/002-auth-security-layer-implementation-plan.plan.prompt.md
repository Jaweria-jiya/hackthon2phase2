---
id: 002
title: Auth Security Layer Implementation Plan
stage: plan
date: 2026-01-29
surface: agent
model: claude-sonnet-4-5-20250929
feature: auth-security-layer
branch: 001-auth-security-layer
user: ALI
command: /sp.plan
labels: ["plan", "architecture", "authentication", "jwt", "better-auth", "fastapi", "implementation"]
links:
  spec: specs/auth-security-layer/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/auth-security-layer/plan.md
tests:
  - none
---

## Prompt

/sp.plan
Project: Todo Full-Stack Web Application — Spec 1: Authentication & Security Layer

## Phase 1: Environment Setup (30 mins)
**Goal:** Configure shared secret and install dependencies

Tasks:
1. Generate strong random secret: `openssl rand -base64 32`
2. Add `BETTER_AUTH_SECRET` to both:
   - Frontend: `apps/web/.env.local`
   - Backend: `apps/api/.env`
3. Install frontend dependencies:
```bash
   npm install better-auth
```
4. Install backend dependencies:
```bash
   pip install "python-jose[cryptography]" python-multipart
```

Validation:
- Both services can read `BETTER_AUTH_SECRET` from environment
- Dependencies install without errors

---

## Phase 2: Better Auth Configuration (1 hour)
**Goal:** Enable JWT plugin and create auth API routes

Tasks:
1. Create `lib/auth.ts` with Better Auth configuration:
   - Enable JWT plugin with 7-day expiry
   - Configure email/password provider
   - Set secret from environment variable
2. Create API route handler: `app/api/auth/[...all]/route.ts`
3. Create auth context provider for client-side session
4. Add signup and signin page components

Validation:
- `/api/auth/signup` endpoint accepts POST requests
- `/api/auth/signin` returns JWT token in response
- Token payload contains `sub` (user_id) and `exp` (expiry)

---

## Phase 3: Frontend API Client (45 mins)
**Goal:** Attach JWT token to all API requests

Tasks:
1. Create API client utility: `lib/api-client.ts`
2. Extract token from Better Auth session
3. Add interceptor to attach `Authorization: Bearer <token>` header
4. Handle 401 responses by redirecting to signin

Validation:
- API requests include Authorization header when user is logged in
- Requests without token do not include header
- Token is correctly formatted: `Bearer eyJhbGc...`

---

## Phase 4: FastAPI JWT Middleware (1.5 hours)
**Goal:** Verify JWT and extract user identity

Tasks:
1. Create `app/auth/jwt.py` module:
   - Function to decode and verify JWT using `python-jose`
   - Extract `sub` claim as `user_id`
   - Handle expired tokens and invalid signatures
2. Create FastAPI dependency: `get_current_user()`
   - Extract token from Authorization header
   - Verify signature using `BETTER_AUTH_SECRET`
   - Return user_id or raise 401 HTTPException
3. Create dependency: `verify_user_access(user_id: str, current_user: str)`
   - Compare URL `user_id` with token `user_id`
   - Raise 403 if mismatch

Validation:
- Valid token successfully decodes to user_id
- Expired token raises 401 error
- Invalid signature raises 401 error
- Token with wrong secret raises 401 error

---

## Phase 5: Protect API Endpoints (1 hour)
**Goal:** Enforce authentication on all task routes

Tasks:
1. Update all `/api/{user_id}/tasks/*` routes:
   - Add `current_user = Depends(get_current_user)` parameter
   - Add `Depends(verify_user_access)` check
2. Filter database queries by `current_user` ID:
```python
   tasks = db.query(Task).filter(Task.user_id == current_user).all()
```
3. Add error handling for 401 and 403 responses

Validation:
- Authenticated user can access their own tasks
- Authenticated user cannot access other users' tasks (403)
- Unauthenticated request returns 401
- Invalid token returns 401

---

## Phase 6: Integration Testing (1 hour)
**Goal:** Verify end-to-end authentication flow

Test scenarios:
1. **Signup flow:**
   - Create new user via Better Auth
   - Verify user record in database
2. **Signin flow:**
   - Login with valid credentials
   - Receive JWT token
   - Decode token manually to verify payload
3. **Authenticated API access:**
   - Create task for user A
   - Fetch tasks as user A (success)
   - Try to fetch tasks as user B using user A's token (403)
4. **Unauthenticated access:**
   - Call API without token (401)
   - Call API with expired token (401)
   - Call API with malformed token (401)

Validation:
- All test scenarios pass
- No user can access another user's data
- Token expiry is enforced

---

## Phase 7: Documentation (30 mins)
**Goal:** Document configuration and usage

Tasks:
1. Create `docs/auth-setup.md`:
   - How to generate `BETTER_AUTH_SECRET`
   - Environment variable setup for both services
   - Better Auth configuration options
2. Create `docs/api-authentication.md`:
   - How to obtain JWT token
   - How to attach token to requests
   - Common error codes and solutions
3. Add inline code comments for:
   - JWT verification logic
   - User access checks
   - Token extraction

Validation:
- Another developer can set up auth using docs alone
- All configuration steps are reproducible

---

## Estimated Total Time: 6 hours

## Dependencies:
- Neon PostgreSQL database must be configured (user table exists)
- Next.js app structure is in place
- FastAPI app structure is in place

## Risks:
- **Secret mismatch:** Frontend and backend must use identical secret
- **Token expiry:** 7-day expiry may be too long for security requirements
- **CORS issues:** Frontend and backend on different ports may need CORS config

## Deliverables:
1. Working Better Auth signup/signin pages
2. JWT token issued on login
3. FastAPI middleware verifying JWT
4. All API endpoints protected and enforcing user isolation
5. Integration tests passing
6. Documentation for setup and usage

## Response snapshot

Created comprehensive implementation plan for Authentication & Security Layer with 8 phases spanning 7.5 hours of development work.

**Plan Structure:**
- **Phase 0 (Research)**: Technology validation for Better Auth JWT plugin, FastAPI JWT verification, shared secret management, database schema
- **Phase 1 (Design)**: Data models (User, Task entities), API contracts (OpenAPI spec), quickstart guide
- **Phase 2 (Environment)**: Secret generation, .env configuration for both services, dependency installation
- **Phase 3 (Better Auth)**: JWT plugin configuration, auth API routes, signup/login pages
- **Phase 4 (API Client)**: Token attachment to requests, Authorization header interceptor, 401 handling
- **Phase 5 (JWT Middleware)**: Token verification with python-jose, user_id extraction, access validation
- **Phase 6 (Protect Endpoints)**: Apply auth dependencies to all task routes, database query filtering
- **Phase 7 (Integration Testing)**: End-to-end auth flow tests, user isolation tests, token expiry tests
- **Phase 8 (Documentation)**: Setup guides, API authentication guide, inline code comments

**Key Architectural Decisions:**
- Web application structure (separate frontend/backend)
- Better Auth with JWT plugin for token issuance (frontend)
- FastAPI dependency injection for JWT verification (backend)
- HS256 symmetric signing with shared BETTER_AUTH_SECRET
- 7-day token expiry (configurable)
- Authorization header transport (Bearer token)
- Database-level user isolation (WHERE user_id = authenticated_user_id)

**Constitution Compliance:**
- ✅ All 6 principles satisfied (Security-First, JWT Management, Auth/Authz Separation, User Isolation, Configuration Reproducibility, API Security Standards)
- ✅ No complexity violations requiring justification

**Project Structure Defined:**
- Frontend: app/, components/, lib/, types/, tests/
- Backend: app/auth/, app/models/, app/api/, tests/
- Documentation: specs/auth-security-layer/ with plan.md, research.md, data-model.md, contracts/, quickstart.md

**Risk Mitigation:**
- Secret mismatch: Health check endpoint, clear documentation
- Token expiry: Configurable setting, documented recommendations
- CORS issues: Explicit configuration, early testing
- Database query filtering: Code review checklist, integration tests
- JWT library compatibility: Use python-jose (FastAPI recommended)

**Agent Coordination:**
- Database-Agent: Create users and tasks tables (prerequisite)
- Auth-Agent: Configure Better Auth and JWT verification (Phases 3, 5)
- Frontend-Agent: Build UI and API client (Phases 3, 4)
- Backend-Agent: Build API endpoints and middleware (Phases 5, 6)

## Outcome

- ✅ Impact: Comprehensive 8-phase implementation plan created with detailed tasks, validation criteria, code examples, and agent coordination strategy
- 🧪 Tests: Integration test scenarios defined for signup, signin, authenticated access, unauthenticated access, user isolation, and token expiry
- 📁 Files: Created specs/auth-security-layer/plan.md (approximately 600 lines with complete implementation roadmap)
- 🔁 Next prompts: Execute Phase 0 research tasks, then Phase 1 design tasks, then run `/sp.tasks` to generate atomic tasks for each agent
- 🧠 Reflection: Plan provides clear separation of concerns across 4 agents with explicit dependencies and validation criteria at each phase. All constitution principles satisfied without complexity violations. Estimated 7.5 hours total implementation time with detailed risk mitigation strategies.

## Evaluation notes (flywheel)

- Failure modes observed: None - plan successfully created with all phases detailed and constitution compliance verified
- Graders run and results (PASS/FAIL): PASS - All phases have clear goals, tasks, validation criteria, and time estimates; agent coordination documented; risks identified with mitigations
- Prompt variant (if applicable): User-provided phase structure integrated with template requirements
- Next experiment (smallest change to try): Execute Phase 0 research tasks to validate technology choices before proceeding to Phase 1 design
