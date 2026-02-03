---
id: 001
title: Auth Security Layer Spec
stage: spec
date: 2026-01-29
surface: agent
model: claude-sonnet-4-5-20250929
feature: auth-security-layer
branch: master
user: ALI
command: /sp.specify
labels: ["spec", "authentication", "jwt", "better-auth", "fastapi", "security", "user-isolation"]
links:
  spec: specs/auth-security-layer/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/auth-security-layer/spec.md
tests:
  - none
---

## Prompt

/sp.specify
Project: Todo Full-Stack Web Application — Spec 1: Authentication & Security Layer

Target audience:
- Hackathon developers using Claude Code + Spec-Kit Plus
- Full-stack engineers integrating Better Auth (Next.js) with FastAPI backend
- Developers with intermediate knowledge of JWT authentication

Focus:
- Secure user authentication using Better Auth JWT plugin
- JWT issuance on frontend (Next.js 16+ App Router)
- JWT verification and user authorization in FastAPI Python backend
- Enforcing user isolation: each user sees only their own tasks
- Stateless authentication without shared database sessions

Success criteria:
- Users can signup with email/password via Better Auth
- Users can signin and receive a valid JWT token
- Frontend automatically attaches JWT to all API requests in Authorization header
- FastAPI middleware validates JWT signature using shared secret
- User identity extracted from JWT `sub` claim, matched against URL `{user_id}`
- All `/api/{user_id}/*` endpoints reject requests without valid JWT (401)
- Cross-user access attempts are blocked (403 Forbidden)
- Token expiry (7 days) is automatically enforced
- Configuration is reproducible via environment variables

Constraints:
- Authentication: Better Auth library on Next.js frontend
- Authorization: FastAPI dependency injection with JWT verification
- JWT transport: `Authorization: Bearer <token>` header only
- Shared secret: `BETTER_AUTH_SECRET` environment variable (both services)
- JWT algorithm: HS256 (symmetric signing)
- Backend library: `python-jose[cryptography]` or `PyJWT`
- No cookies for API authentication
- No session storage on backend
- Token expiry: 7 days (configurable via Better Auth)
- Development environment: .env files for secrets

Not building:
- Social login providers (Google, GitHub, Microsoft)
- Role-based access control (admin, moderator roles)
- Multi-factor authentication (MFA/2FA)
- OAuth 2.0 authorization code flow
- Token refresh rotation mechanism
- Password reset via email
- Account email verification
- Frontend UI styling or custom auth pages
- Rate limiting on auth endpoints
- Login attempt tracking or account lockout

## Response snapshot

Created comprehensive feature specification for Authentication & Security Layer with 5 prioritized user stories:

**User Stories (Prioritized):**
1. **P1 - User Signup with Email/Password**: Foundation for all authentication, validates email format, hashes passwords with bcrypt (cost 12), prevents duplicate accounts
2. **P1 - User Signin and JWT Token Issuance**: Better Auth validates credentials and issues JWT with `sub`, `email`, `iat`, `exp` claims, 7-day expiration
3. **P2 - Protected API Access with JWT Verification**: FastAPI middleware verifies token signature, extracts user_id from `sub` claim, validates URL user_id match
4. **P2 - User Data Isolation Enforcement**: Database queries filter by authenticated user_id (`WHERE user_id = <token_user_id>`), defense-in-depth security
5. **P3 - Token Expiry Handling**: Automatic rejection of expired tokens, frontend redirects to login on 401 responses

**Functional Requirements (18 total):**
- FR-001 to FR-005: Account creation and password management
- FR-006 to FR-010: JWT token issuance and verification
- FR-011 to FR-013: Authorization and data isolation
- FR-014 to FR-018: Security standards and error handling

**Key Entities:**
- User: email, password_hash, UUID identifier
- JWT Token: stateless with `sub`, `email`, `iat`, `exp` claims
- Task: user-specific with foreign key to user

**Success Criteria (10 measurable outcomes):**
- SC-001: Signup in under 30 seconds
- SC-002: Signin within 2 seconds
- SC-003: 100% protected endpoint coverage
- SC-004: 100% cross-user access blocked
- SC-005: JWT verification under 50ms latency
- SC-006: Zero plaintext passwords
- SC-007: Exact 7-day token validity
- SC-008: 100 concurrent auth requests handled
- SC-009: All queries filter by user_id
- SC-010: Reproducible configuration

**Constitution Compliance:**
- Principle I: Security-first with bcrypt, HS256, zero-trust
- Principle II: JWT management with shared secret
- Principle III: Auth/authz separation (Better Auth vs FastAPI)
- Principle IV: User data isolation at query level
- Principle V: Configuration reproducibility via .env
- Principle VI: Consistent error codes (401, 403, 404)

**Edge Cases Addressed:**
- Secret mismatch between services
- Concurrent requests with same token
- Password changes with active tokens
- Tampered JWT payloads
- Invalid UUID formats
- Non-existent user_ids

**Out of Scope (14 items):**
- Social login, RBAC, MFA, OAuth 2.0, token refresh, password reset, email verification, custom UI, rate limiting, account lockout, session storage, remember me, device fingerprinting, IP restrictions

## Outcome

- ✅ Impact: Comprehensive authentication specification created with 5 prioritized user stories, 18 functional requirements, 10 measurable success criteria, and full constitution compliance
- 🧪 Tests: Acceptance scenarios defined for all 5 user stories with Given-When-Then format, edge cases documented
- 📁 Files: Created specs/auth-security-layer/spec.md (approximately 400 lines)
- 🔁 Next prompts: Run `/sp.plan` to design implementation architecture, then `/sp.tasks` to break down into actionable items for each agent
- 🧠 Reflection: Specification provides clear separation between Better Auth (frontend authentication) and FastAPI (backend authorization), with explicit JWT token management flow and defense-in-depth user isolation. All requirements are testable and aligned with security-first constitution principles.

## Evaluation notes (flywheel)

- Failure modes observed: None - specification successfully created with all user stories prioritized and independently testable
- Graders run and results (PASS/FAIL): PASS - All 5 user stories have clear acceptance criteria, functional requirements are specific and measurable, success criteria are quantifiable
- Prompt variant (if applicable): Standard specification creation with security-focused requirements
- Next experiment (smallest change to try): Run `/sp.plan` to validate specification completeness by attempting to design concrete implementation architecture
