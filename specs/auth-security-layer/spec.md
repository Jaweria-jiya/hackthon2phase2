# Feature Specification: Authentication & Security Layer

**Feature Branch**: `001-auth-security-layer`
**Created**: 2026-01-29
**Status**: Draft
**Input**: User description: "Secure user authentication using Better Auth JWT plugin with JWT issuance on frontend (Next.js 16+ App Router) and JWT verification in FastAPI Python backend, enforcing user isolation where each user sees only their own tasks"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Signup with Email/Password (Priority: P1)

A new user visits the application and creates an account by providing their email address and password. The system validates the input, securely hashes the password using bcrypt or argon2, stores the user record in the database, and confirms successful account creation.

**Why this priority**: This is the foundational capability - without user accounts, no other authentication features can function. This is the entry point for all users.

**Independent Test**: Can be fully tested by submitting a signup form with valid email/password, verifying the user record exists in the database with a hashed password, and confirming no plaintext passwords are stored. Delivers immediate value by allowing user registration.

**Acceptance Scenarios**:

1. **Given** a new user on the signup page, **When** they submit a valid email (user@example.com) and strong password (min 8 chars), **Then** the system creates a user account, hashes the password with bcrypt (cost factor 12), stores it in the database, and displays a success message
2. **Given** a user on the signup page, **When** they submit an email that already exists in the system, **Then** the system returns an error "Email already registered" without revealing whether the account exists
3. **Given** a user on the signup page, **When** they submit an invalid email format (missing @, invalid domain), **Then** the system returns a validation error "Invalid email format" before attempting database operations
4. **Given** a user on the signup page, **When** they submit a weak password (less than 8 characters), **Then** the system returns an error "Password must be at least 8 characters"

---

### User Story 2 - User Signin and JWT Token Issuance (Priority: P1)

An existing user enters their email and password on the login page. Better Auth validates the credentials against the database, and upon successful verification, issues a JWT token signed with HS256 algorithm. The token contains the user's ID (`sub` claim), email, issued-at timestamp (`iat`), and expiration timestamp (`exp` set to 7 days). The frontend stores this token securely.

**Why this priority**: Authentication is meaningless without the ability to sign in. This is the second foundational piece that enables all subsequent protected operations.

**Independent Test**: Can be fully tested by submitting valid credentials, verifying a JWT token is returned, decoding the token to confirm it contains correct claims (`sub`, `email`, `iat`, `exp`), and verifying the token signature using the shared secret. Delivers immediate value by enabling user authentication.

**Acceptance Scenarios**:

1. **Given** a registered user on the login page, **When** they submit correct email and password, **Then** Better Auth validates credentials, issues a JWT token with `sub` (user_id), `email`, `iat`, and `exp` (7 days from now), and returns the token to the frontend
2. **Given** a user on the login page, **When** they submit an incorrect password, **Then** the system returns "Invalid credentials" without revealing whether the email exists (prevent enumeration)
3. **Given** a user on the login page, **When** they submit an email that doesn't exist, **Then** the system returns "Invalid credentials" with the same response time as incorrect password (prevent timing attacks)
4. **Given** a successfully authenticated user, **When** the frontend receives the JWT token, **Then** the token is stored in httpOnly cookies and automatically attached to all subsequent API requests via `Authorization: Bearer <token>` header

---

### User Story 3 - Protected API Access with JWT Verification (Priority: P2)

When the frontend makes a request to any protected endpoint (e.g., `GET /api/{user_id}/tasks`), it includes the JWT token in the `Authorization: Bearer <token>` header. The FastAPI backend middleware intercepts the request, extracts the token, verifies the signature using the shared `BETTER_AUTH_SECRET`, decodes the payload to extract the user_id from the `sub` claim, and validates that the `user_id` in the URL matches the authenticated user's ID. Only if all checks pass does the request proceed to the route handler.

**Why this priority**: This is the core authorization mechanism that protects all user data. Without this, authentication is useless because anyone could access any endpoint.

**Independent Test**: Can be fully tested by making API requests with valid tokens, invalid tokens, expired tokens, and tampered tokens. Verify that only valid tokens with matching user_ids are accepted. Delivers immediate value by securing all API endpoints.

**Acceptance Scenarios**:

1. **Given** an authenticated user with a valid JWT token, **When** they request `GET /api/{user_id}/tasks` with their own user_id in the URL, **Then** the middleware verifies the token signature, extracts `sub` claim, confirms it matches the URL user_id, and allows the request to proceed
2. **Given** a user with a valid JWT token, **When** they attempt to access `GET /api/{other_user_id}/tasks` with a different user_id, **Then** the middleware detects the mismatch between token `sub` and URL user_id, and returns 403 Forbidden
3. **Given** a request to a protected endpoint, **When** no Authorization header is present, **Then** the middleware returns 401 Unauthorized with message "Missing authentication token"
4. **Given** a request with an invalid JWT token (malformed, wrong signature), **When** the middleware attempts to verify it, **Then** it returns 401 Unauthorized with message "Invalid token"
5. **Given** a request with an expired JWT token (exp claim is in the past), **When** the middleware verifies the token, **Then** it returns 401 Unauthorized with message "Token expired"

---

### User Story 4 - User Data Isolation Enforcement (Priority: P2)

All database queries for user-specific resources (tasks) automatically filter by the authenticated user's ID extracted from the JWT token. Even if authorization checks are bypassed, the database query itself ensures users can only access their own data by including `WHERE user_id = <authenticated_user_id>` in all queries.

**Why this priority**: This is defense-in-depth security. Even if there's a bug in the authorization middleware, the database layer prevents data leakage.

**Independent Test**: Can be fully tested by creating tasks for multiple users, then attempting to query tasks with different user_ids in the URL while authenticated as a specific user. Verify that only the authenticated user's tasks are returned regardless of URL manipulation. Delivers immediate value by guaranteeing data isolation.

**Acceptance Scenarios**:

1. **Given** User A is authenticated and requests `GET /api/{user_a_id}/tasks`, **When** the query executes, **Then** the database query includes `WHERE user_id = user_a_id` and returns only User A's tasks
2. **Given** User A is authenticated and User B has 5 tasks, **When** User A requests `GET /api/{user_a_id}/tasks`, **Then** User B's tasks are never included in the result set regardless of any bugs in the application logic
3. **Given** User A is authenticated and requests `GET /api/{user_a_id}/tasks/{task_id}` for a task owned by User B, **When** the query executes with `WHERE user_id = user_a_id AND id = task_id`, **Then** the query returns no results and the API returns 404 Not Found (preventing enumeration)

---

### User Story 5 - Token Expiry Handling (Priority: P3)

JWT tokens automatically expire after 7 days (configurable via Better Auth). When a user attempts to use an expired token, the backend rejects it with a 401 Unauthorized response. The frontend detects this and redirects the user to the login page.

**Why this priority**: This is important for security but not critical for initial functionality. Users can still authenticate and use the system; this just adds time-based security.

**Independent Test**: Can be fully tested by creating a token with a short expiry (e.g., 1 second), waiting for it to expire, then attempting to use it. Verify the backend rejects it and the frontend handles the error gracefully. Delivers value by limiting the window of opportunity for stolen tokens.

**Acceptance Scenarios**:

1. **Given** a user has a JWT token that expired 1 hour ago, **When** they make a request to a protected endpoint, **Then** the middleware detects the expired `exp` claim and returns 401 Unauthorized with message "Token expired"
2. **Given** a user receives a 401 "Token expired" response, **When** the frontend error handler processes it, **Then** the user is redirected to the login page with a message "Your session has expired. Please log in again"
3. **Given** a user logs in successfully, **When** the JWT token is issued, **Then** the `exp` claim is set to exactly 7 days (604800 seconds) from the current time

---

### Edge Cases

- **What happens when the shared secret (`BETTER_AUTH_SECRET`) is different between frontend and backend?**
  The backend will fail to verify any JWT tokens issued by the frontend, resulting in all requests returning 401 Unauthorized. This should be caught during initial setup and testing.

- **How does the system handle concurrent requests with the same JWT token?**
  JWT tokens are stateless, so multiple concurrent requests with the same valid token are all processed independently. No session locking or coordination is needed.

- **What happens if a user changes their password while having an active JWT token?**
  The existing JWT token remains valid until expiration (7 days) because JWT is stateless. To invalidate tokens immediately, a token revocation mechanism (not in scope) would be needed.

- **How does the system handle JWT tokens with tampered payloads but valid signatures?**
  This is cryptographically impossible with HS256. If the payload is modified, the signature verification will fail, and the token is rejected with 401 Unauthorized.

- **What happens if the `user_id` in the URL is not a valid UUID format?**
  The FastAPI route validation should reject the request with 422 Unprocessable Entity before reaching the authorization middleware.

- **How does the system handle requests to `/api/{user_id}/tasks` where user_id is valid but doesn't exist in the database?**
  The authorization middleware validates the token and user_id match. If the user_id doesn't exist in the database, the query returns an empty result set, and the API returns 404 Not Found.

- **What happens if the JWT token is sent in both the Authorization header and a cookie?**
  The middleware should only check the Authorization header for API requests. Cookies are used for session management on the frontend but not for API authentication.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create accounts with email and password via Better Auth signup flow
- **FR-002**: System MUST validate email addresses using standard RFC 5322 format before account creation
- **FR-003**: System MUST hash passwords using bcrypt (minimum cost factor 12) or argon2 before storing in database
- **FR-004**: System MUST prevent duplicate account creation by rejecting signup attempts with existing email addresses
- **FR-005**: System MUST authenticate users by verifying email and password against stored credentials
- **FR-006**: System MUST issue JWT tokens signed with HS256 algorithm upon successful authentication
- **FR-007**: System MUST include `sub` (user_id), `email`, `iat` (issued at), and `exp` (expiration) claims in JWT payload
- **FR-008**: System MUST set JWT token expiration to 7 days (604800 seconds) from issuance time
- **FR-009**: System MUST verify JWT token signatures using shared `BETTER_AUTH_SECRET` on all protected endpoints
- **FR-010**: System MUST extract user identity from JWT `sub` claim and validate it matches the `user_id` in the request URL
- **FR-011**: System MUST return 401 Unauthorized for requests with missing, invalid, or expired JWT tokens
- **FR-012**: System MUST return 403 Forbidden for requests where authenticated user_id does not match URL user_id
- **FR-013**: System MUST filter all database queries by authenticated user_id to enforce data isolation
- **FR-014**: System MUST transport JWT tokens via `Authorization: Bearer <token>` header for API requests
- **FR-015**: System MUST store JWT tokens in httpOnly cookies on the frontend for session persistence
- **FR-016**: System MUST use the same `BETTER_AUTH_SECRET` value in both frontend and backend environments
- **FR-017**: System MUST NOT expose sensitive information (stack traces, SQL errors, internal paths) in error responses
- **FR-018**: System MUST return consistent error messages for invalid credentials to prevent user enumeration

### Key Entities

- **User**: Represents an authenticated user account with unique email, hashed password, and UUID identifier. Each user owns zero or more tasks and can only access their own data.
- **JWT Token**: A stateless authentication token containing user identity (`sub` claim), email, issuance timestamp (`iat`), and expiration timestamp (`exp`). Signed with HS256 using shared secret.
- **Task**: A user-specific todo item with title, description, completion status, and foreign key reference to the owning user. All task queries must filter by authenticated user_id.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete account signup in under 30 seconds with valid email and password
- **SC-002**: Users can sign in and receive a valid JWT token within 2 seconds of submitting credentials
- **SC-003**: 100% of protected API endpoints reject requests without valid JWT tokens (401 Unauthorized)
- **SC-004**: 100% of cross-user access attempts are blocked with 403 Forbidden responses
- **SC-005**: JWT token verification adds less than 50ms latency to API request processing
- **SC-006**: Zero plaintext passwords are stored in the database (100% bcrypt/argon2 hashed)
- **SC-007**: JWT tokens remain valid for exactly 7 days (604800 seconds) from issuance
- **SC-008**: System handles 100 concurrent authentication requests without errors or degradation
- **SC-009**: All database queries for user-specific resources include `WHERE user_id = <authenticated_user_id>` filter
- **SC-010**: Configuration is reproducible: developers can set up authentication by copying `.env.example` and generating a single shared secret

### Constitution Compliance

This specification adheres to the following constitution principles:

- **Principle I (Security-First Authentication)**: All passwords hashed with bcrypt (cost 12), JWT tokens signed with HS256, tokens validated on every request
- **Principle II (JWT Token Management)**: Better Auth issues tokens, FastAPI verifies with shared secret, tokens transported via Authorization header
- **Principle III (Authentication vs Authorization Separation)**: Better Auth handles identity verification, FastAPI handles access control and ownership validation
- **Principle IV (User Data Isolation)**: All queries filter by authenticated user_id at database level
- **Principle V (Configuration Reproducibility)**: All secrets in environment variables, setup documented with secret generation commands
- **Principle VI (API Security Standards)**: Consistent error codes (401, 403, 404), no sensitive information in errors

## Out of Scope

The following features are explicitly NOT included in this specification:

- Social login providers (Google, GitHub, Microsoft OAuth)
- Role-based access control (admin, moderator, user roles)
- Multi-factor authentication (MFA/2FA via SMS, TOTP, or email)
- OAuth 2.0 authorization code flow for third-party integrations
- Token refresh rotation mechanism (automatic token renewal)
- Password reset via email with secure token links
- Account email verification before activation
- Custom authentication UI styling or branded login pages
- Rate limiting on authentication endpoints (login attempt throttling)
- Login attempt tracking or account lockout after failed attempts
- Session management with server-side session storage
- Remember me functionality with extended token expiry
- Device fingerprinting or trusted device management
- IP-based access restrictions or geolocation blocking

## Technical Constraints

### Frontend (Next.js 16+ App Router)
- Better Auth library with JWT plugin enabled
- Token storage in httpOnly cookies
- Automatic token attachment to API requests via interceptor
- Environment variable: `BETTER_AUTH_SECRET` (min 32 characters)
- Environment variable: `NEXT_PUBLIC_API_URL` (FastAPI backend URL)

### Backend (FastAPI)
- JWT verification library: `python-jose[cryptography]` or `PyJWT`
- Password hashing library: `bcrypt` or `argon2-cffi`
- JWT algorithm: HS256 (symmetric signing)
- Environment variable: `BETTER_AUTH_SECRET` (must match frontend)
- Environment variable: `DATABASE_URL` (Neon PostgreSQL connection string)
- Middleware: JWT verification dependency injection on all protected routes

### Database (Neon PostgreSQL)
- Users table: `id` (UUID), `email` (unique), `password_hash`, `created_at`
- Tasks table: `id` (UUID), `user_id` (FK to users), `title`, `description`, `completed`, `created_at`, `updated_at`
- Index on `tasks.user_id` for query performance
- Foreign key constraint: `tasks.user_id` references `users.id` with ON DELETE CASCADE

### Security
- JWT token expiry: 7 days (604800 seconds)
- Password hashing: bcrypt cost factor 12 or argon2 default parameters
- Shared secret: minimum 32 characters, cryptographically random
- Token transport: `Authorization: Bearer <token>` header only (no query params)
- Error messages: generic, no information disclosure

## Dependencies

- **Better Auth**: Next.js authentication library with JWT plugin
- **python-jose[cryptography]** or **PyJWT**: Python JWT verification
- **bcrypt** or **argon2-cffi**: Password hashing
- **SQLModel**: Database ORM for user and task models
- **Neon PostgreSQL**: Serverless database for user and task storage
- **FastAPI**: Python web framework with dependency injection

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Shared secret mismatch between frontend and backend | High - All authentication fails | Document setup process clearly, add health check endpoint to verify JWT verification works |
| JWT token stolen via XSS attack | High - Attacker gains user access | Store tokens in httpOnly cookies (not localStorage), implement Content Security Policy |
| Weak password acceptance | Medium - Accounts vulnerable to brute force | Enforce minimum 8 character password length, recommend password strength indicator |
| Token expiry too long (7 days) | Medium - Stolen tokens valid for extended period | Document that 7 days is configurable, recommend shorter expiry for high-security applications |
| Database query missing user_id filter | Critical - Data leakage across users | Code review checklist, integration tests for cross-user access attempts |
| Timing attacks on login endpoint | Low - Email enumeration possible | Ensure consistent response time for invalid email vs invalid password |

## Next Steps

1. **Architecture Planning** (`/sp.plan`): Design the implementation architecture including Better Auth configuration, FastAPI middleware structure, database schema, and JWT verification flow
2. **Task Breakdown** (`/sp.tasks`): Create actionable tasks for each agent (Database-Agent, Backend-Agent, Auth-Agent, Frontend-Agent)
3. **Implementation**: Execute tasks in dependency order (Database → Backend → Auth → Frontend)
4. **Integration Testing**: Verify end-to-end authentication flow with all security checks
