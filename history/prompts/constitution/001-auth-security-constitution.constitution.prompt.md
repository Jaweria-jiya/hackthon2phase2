---
id: 001
title: Auth Security Constitution
stage: constitution
date: 2026-01-29
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: ALI
command: /sp.constitution
labels: ["constitution", "security", "authentication", "jwt", "better-auth", "fastapi"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

/sp.constitution
Project: Todo Full-Stack Web Application — Spec 1: Authentication & Security Layer

Core principles:
- Security-first authentication with zero-trust token verification
- Correct JWT issuance (frontend) and verification (backend)
- Clear separation: authentication (Better Auth) vs authorization (FastAPI)
- User isolation enforced at every endpoint
- Reproducibility through documented configuration steps

Key standards:
- All `/api/{user_id}/*` endpoints require valid JWT in Authorization header
- JWT issued by Better Auth with HS256 algorithm
- FastAPI verifies JWT signature using shared BETTER_AUTH_SECRET
- User identity extracted from token `sub` claim, matched against URL `user_id`
- Protected routes enforce ownership: token user_id must match resource owner
- Invalid/missing tokens return 401; unauthorized access returns 403

Constraints:
- Authentication: Better Auth (Next.js) with JWT plugin enabled
- Authorization: FastAPI middleware using python-jose or PyJWT
- JWT transport: Authorization header (Bearer token)

## Response snapshot

Created comprehensive constitution v1.0.0 for Todo Full-Stack Web Application with 6 core security principles:

**Core Principles Defined:**
1. Security-First Authentication - Zero-trust token verification with bcrypt/argon2 password hashing
2. JWT Token Management - Correct issuance (Better Auth) and verification (FastAPI) with shared secret
3. Authentication vs Authorization Separation - Clear boundaries between identity verification and access control
4. User Data Isolation - Absolute isolation enforced at database query level
5. Configuration Reproducibility - All security configuration documented and version-controlled
6. API Security Standards - Consistent error handling (401, 403, 404) and rate limiting

**Sections Added:**
- Technology Stack Constraints (Better Auth, FastAPI, Neon PostgreSQL, SQLModel)
- Security Standards (JWT configuration, environment variables, endpoint security matrix)
- Development Workflow (pre-implementation checklist, code review requirements, testing requirements)
- Governance (amendment process, compliance verification, conflict resolution)

**Key Security Requirements:**
- JWT tokens signed with HS256 using minimum 32-character secret
- All protected endpoints verify `user_id` in URL matches token `sub` claim
- Database queries filter by authenticated user: `WHERE user_id = <token_user_id>`
- Passwords hashed with bcrypt (cost factor 12) or argon2
- Token expiration set to 24 hours with refresh mechanism
- Rate limiting on auth endpoints (5 attempts/minute/IP)

## Outcome

- ✅ Impact: Constitution v1.0.0 ratified with comprehensive security and authentication principles for multi-agent Todo application development
- 🧪 Tests: No tests required (documentation artifact)
- 📁 Files: Created/updated .specify/memory/constitution.md with 192 lines covering 6 principles, 4 major sections, and governance rules
- 🔁 Next prompts: Run `/sp.specify` to create feature specification aligned with constitution principles, then `/sp.plan` for architecture design
- 🧠 Reflection: Constitution establishes security-first foundation with clear separation between Better Auth (authentication) and FastAPI (authorization), enabling safe multi-agent development with explicit JWT token management and user isolation requirements

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution successfully created with all placeholders filled
- Graders run and results (PASS/FAIL): PASS - All 6 principles defined with rationale, technology stack specified, security standards documented
- Prompt variant (if applicable): Standard constitution creation with security-focused principles
- Next experiment (smallest change to try): Create feature specification using `/sp.specify` to validate constitution principles apply correctly to concrete implementation scenarios
