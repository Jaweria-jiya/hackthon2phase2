<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified principles: None (all existing principles preserved)
- Added sections:
  - Principle VII: Professional UI & Brand Consistency
  - Principle VIII: Component Architecture & Reusability
  - Principle IX: Optimistic UI & Performance
  - Principle X: Responsive Design & Accessibility
  - Principle XI: Secure API Integration
  - Principle XII: Form Validation & Error Handling
  - Frontend Technology Stack section
  - UI/UX Standards section
- Removed sections: None
- Templates requiring updates:
  - ✅ spec-template.md (frontend requirements alignment)
  - ✅ plan-template.md (frontend architecture checks)
  - ✅ tasks-template.md (UI/UX task categories)
- Follow-up TODOs: None
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Security-First Authentication
**Zero-trust token verification at every endpoint.**

All authentication flows MUST implement defense-in-depth:
- Passwords MUST be hashed using bcrypt or argon2 (minimum cost factor 12 for bcrypt)
- JWT tokens MUST be signed with HS256 algorithm using a cryptographically secure secret (minimum 32 characters)
- Tokens MUST include expiration claims (`exp`) and be validated on every request
- Authentication state MUST never be assumed; every request requires explicit verification
- Sensitive operations (password reset, email change) MUST require re-authentication

**Rationale**: Security vulnerabilities in authentication lead to complete system compromise. Zero-trust ensures no implicit trust relationships exist.

### II. JWT Token Management
**Correct issuance (frontend) and verification (backend) with shared secret.**

JWT lifecycle MUST follow these rules:
- **Issuance**: Better Auth (Next.js frontend) issues JWT tokens upon successful login
- **Transport**: Tokens MUST be sent via `Authorization: Bearer <token>` header (NOT query params or cookies for API calls)
- **Storage**: Frontend stores tokens in httpOnly cookies for session management
- **Verification**: FastAPI backend MUST verify signature using shared `BETTER_AUTH_SECRET`
- **Claims**: Token payload MUST include `sub` (user_id), `email`, `iat` (issued at), `exp` (expiration)
- **Expiration**: Tokens expire after 24 hours; refresh mechanism required for longer sessions

**Rationale**: Shared secret enables stateless authentication across separate frontend/backend services while maintaining security.

### III. Authentication vs Authorization Separation
**Clear boundaries between identity verification and access control.**

- **Authentication** (Better Auth): Verifies "who you are" - handles signup, login, password management, token issuance
- **Authorization** (FastAPI): Verifies "what you can access" - validates tokens, extracts user identity, enforces ownership rules
- Frontend MUST NOT make authorization decisions; backend is the single source of truth
- Backend MUST validate token signature before trusting any claims
- URL parameters (e.g., `user_id`) MUST be validated against authenticated identity

**Rationale**: Separation prevents privilege escalation and ensures consistent security enforcement at the API layer.

### IV. User Data Isolation
**Absolute isolation enforced at every endpoint.**

Every data access MUST enforce user ownership:
- All `/api/{user_id}/*` endpoints MUST verify `user_id` in URL matches token `sub` claim
- Database queries MUST filter by authenticated user: `WHERE user_id = <token_user_id>`
- Cross-user data access MUST return 403 Forbidden (even if resource exists)
- List endpoints MUST only return resources owned by authenticated user
- Bulk operations MUST validate ownership for every affected resource

**Rationale**: User data leakage is unacceptable. Defense-in-depth at query level prevents authorization bypass bugs.

### V. Configuration Reproducibility
**All security configuration MUST be documented and version-controlled.**

Environment setup MUST be reproducible:
- All secrets defined in `.env.example` with placeholder values
- Shared secrets (e.g., `BETTER_AUTH_SECRET`) MUST be documented in both frontend and backend configs
- JWT algorithm, expiration, and claim structure MUST be documented in API specification
- Database connection strings MUST use environment variables (NEVER hardcoded)
- Setup instructions MUST include step-by-step secret generation (e.g., `openssl rand -base64 32`)

**Rationale**: Security misconfigurations are a leading cause of breaches. Reproducible setup prevents deployment errors.

### VI. API Security Standards
**Consistent error handling and status codes.**

HTTP responses MUST follow these rules:
- **401 Unauthorized**: Missing, invalid, or expired JWT token
- **403 Forbidden**: Valid token but insufficient permissions (user_id mismatch)
- **404 Not Found**: Resource doesn't exist OR user lacks permission (prevent enumeration)
- Error messages MUST NOT leak sensitive information (no stack traces, internal paths, or SQL errors in production)
- Rate limiting MUST be implemented on authentication endpoints (max 5 login attempts per minute per IP)
- CORS MUST be explicitly configured (no `Access-Control-Allow-Origin: *` in production)

**Rationale**: Consistent error handling prevents information disclosure and ensures predictable client behavior.

### VII. Professional UI & Brand Consistency
**Polished, cohesive visual design with strict adherence to brand palette.**

All UI components MUST follow these standards:
- **Color Palette** (strictly enforced):
  - Primary: `#a47ec2` (purple) - CTAs, highlights, active states, focus indicators
  - Secondary: `#F6E3BA` (cream) - backgrounds, cards, subtle accents, hover states
  - Neutral: `#000000` (black) - text, borders, contrast elements
- **Typography**: System font stack with clear hierarchy (headings, body, captions)
- **Spacing**: Consistent use of Tailwind spacing scale (4px base unit)
- **Shadows**: Subtle elevation using Tailwind shadow utilities (no custom shadows)
- **Borders**: Consistent border radius and thickness across all components
- **Icons**: lucide-react or heroicons only (consistent style, no mixing)
- **No inline styles**: All styling via Tailwind utility classes

**Rationale**: Professional appearance builds user trust. Consistent branding creates memorable user experience and prevents "beginner project" aesthetic.

### VIII. Component Architecture & Reusability
**Strong separation of concerns with typed, testable components.**

Component structure MUST follow these rules:
- **Separation**: UI components → data fetching hooks → API client layer
- **Reusability**: Components MUST be generic and composable (no hardcoded data)
- **TypeScript**: All components MUST have explicit prop types (no `any`)
- **Server Components**: Use React Server Components for static content and initial data
- **Client Components**: Mark with `"use client"` only when needed (interactivity, hooks, browser APIs)
- **File Organization**:
  - `app/` - Next.js App Router pages and layouts
  - `components/` - Reusable UI components
  - `lib/` - API client, utilities, types
  - `hooks/` - Custom React hooks for data fetching and state

**Rationale**: Clear architecture prevents spaghetti code. Reusable components reduce duplication and improve maintainability.

### IX. Optimistic UI & Performance
**Instant feedback with graceful degradation on errors.**

Navigation and interactions MUST feel immediate:
- **Navigation**: Use Next.js `<Link>` with prefetching enabled (no `<a>` tags)
- **Optimistic Updates**: Update UI immediately, rollback on error
- **Loading States**: Skeleton loaders (not generic spinners) for content areas
- **Error States**: Actionable messages with retry options (not "Something went wrong")
- **Success States**: Brief confirmation feedback (toast notifications, checkmarks)
- **No Loading Delays**: Avoid artificial delays or blocking operations
- **Prefetching**: Leverage Next.js automatic prefetching for instant page transitions
- **State Management**: React hooks with proper loading/error/success states

**Rationale**: Perceived performance is as important as actual performance. Optimistic UI creates smooth, app-like experience.

### X. Responsive Design & Accessibility
**Flawless experience across all devices and for all users.**

All pages and components MUST meet these standards:
- **Responsive Breakpoints**: Mobile-first design (320px+), tablet (768px+), desktop (1024px+, 1920px+)
- **Touch Targets**: Minimum 44x44px for interactive elements (WCAG 2.1 Level AA)
- **Keyboard Navigation**: All interactive elements accessible via keyboard (Tab, Enter, Escape)
- **Focus Indicators**: Visible focus states using primary color (#a47ec2)
- **ARIA Labels**: Proper semantic HTML and ARIA attributes for screen readers
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text (WCAG 2.1 Level AA)
- **Form Labels**: All inputs MUST have associated labels (visible or aria-label)
- **Error Announcements**: Form errors announced to screen readers (aria-live)

**Rationale**: Accessibility is not optional. Responsive design ensures usability across devices. WCAG compliance prevents legal issues and improves UX for everyone.

### XI. Secure API Integration
**Centralized, type-safe API communication with automatic JWT injection.**

API integration MUST follow these patterns:
- **Centralized Client**: Single API client module (`lib/api-client.ts`) wrapping fetch
- **JWT Injection**: Automatically include `Authorization: Bearer <token>` header from Better Auth session
- **Type Safety**: All API responses typed with TypeScript interfaces
- **Error Handling**: Consistent error parsing and user-friendly messages
- **Retry Logic**: Automatic retry for transient failures (network errors, 5xx)
- **Timeout Handling**: Request timeouts with fallback behavior
- **No Direct Database Access**: Frontend NEVER connects to database directly
- **Environment Variables**: API base URL from `NEXT_PUBLIC_API_URL` environment variable

**Rationale**: Centralized API client ensures consistent security, error handling, and type safety. Prevents scattered fetch calls with inconsistent patterns.

### XII. Form Validation & Error Handling
**Real-time validation with clear, actionable feedback.**

All forms MUST implement:
- **Client-Side Validation**: Immediate feedback on blur/change (before submission)
- **Server-Side Validation**: Backend MUST re-validate all inputs (never trust client)
- **Field-Level Errors**: Display errors next to relevant fields (not just at top)
- **Error Messages**: Specific, actionable guidance (not generic "Invalid input")
- **Success Feedback**: Clear confirmation after successful submission
- **Disabled States**: Disable submit button during processing (prevent double-submit)
- **Loading Indicators**: Show progress during async operations
- **Validation Rules**:
  - Email: RFC 5322 format validation
  - Password: Minimum 8 characters, complexity requirements
  - Required fields: Clear visual indicators (asterisk, label text)

**Rationale**: Good form UX reduces user frustration and support requests. Client-side validation provides instant feedback; server-side prevents security bypasses.

## Technology Stack Constraints

### Authentication Layer
- **Frontend**: Better Auth (Next.js) with JWT plugin enabled
- **Backend**: FastAPI with JWT verification middleware
- **JWT Library**: `python-jose[cryptography]` or `PyJWT` for token verification
- **Password Hashing**: `bcrypt` or `argon2-cffi`

### Frontend Layer
- **Framework**: Next.js 16+ with App Router (NOT Pages Router)
- **React**: React 18+ with Server Components and Client Components
- **Styling**: Tailwind CSS 3+ with custom color palette configuration
- **TypeScript**: Strict mode enabled for type safety
- **Icons**: lucide-react or heroicons (consistent style)
- **Forms**: React Hook Form or native form handling with validation
- **State Management**: React hooks (useState, useReducer, useContext)
- **Data Fetching**: SWR or React Query for caching and revalidation (optional)

### Database Layer
- **Database**: Neon Serverless PostgreSQL
- **ORM**: SQLModel (combines SQLAlchemy + Pydantic)
- **Migrations**: Alembic with async support

### API Layer
- **Framework**: FastAPI with async/await support
- **Validation**: Pydantic v2 models for request/response validation
- **Documentation**: OpenAPI/Swagger auto-generated from FastAPI

## Security Standards

### JWT Configuration
```python
# Backend JWT verification settings
ALGORITHM = "HS256"
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")  # MUST match frontend
TOKEN_EXPIRE_HOURS = 24
```

### Required Environment Variables
**Frontend (.env.local)**:
```
BETTER_AUTH_SECRET=<min-32-char-secret>
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Backend (.env)**:
```
BETTER_AUTH_SECRET=<same-secret-as-frontend>
DATABASE_URL=postgresql+asyncpg://user:pass@neon-host/dbname?ssl=require
CORS_ORIGINS=http://localhost:3000
```

### Endpoint Security Matrix
| Endpoint Pattern | Auth Required | Validation |
|-----------------|---------------|------------|
| `/api/auth/signup` | ❌ | Email format, password strength |
| `/api/auth/login` | ❌ | Credential verification |
| `/api/{user_id}/tasks` | ✅ | JWT + user_id match |
| `/api/{user_id}/tasks/{id}` | ✅ | JWT + user_id match + ownership |

## UI/UX Standards

### Color Palette Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#a47ec2',    // Purple - CTAs, highlights
        secondary: '#F6E3BA',  // Cream - backgrounds, cards
        neutral: '#000000',    // Black - text, borders
      }
    }
  }
}
```

### Component Patterns
**Button Variants**:
- Primary: `bg-primary text-white hover:bg-primary/90`
- Secondary: `bg-secondary text-neutral hover:bg-secondary/90`
- Outline: `border-2 border-primary text-primary hover:bg-primary hover:text-white`

**Card Pattern**:
- Background: `bg-secondary`
- Border: `border border-neutral/10`
- Shadow: `shadow-sm hover:shadow-md`
- Padding: `p-4 md:p-6`

**Form Input Pattern**:
- Base: `border border-neutral/20 rounded-lg px-4 py-2`
- Focus: `focus:outline-none focus:ring-2 focus:ring-primary`
- Error: `border-red-500 focus:ring-red-500`

### Responsive Breakpoints
```javascript
// Tailwind default breakpoints (mobile-first)
sm: '640px'   // Small tablets
md: '768px'   // Tablets
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large desktops
```

## Development Workflow

### Pre-Implementation Checklist
Before implementing any feature:
1. ✅ Verify authentication requirements in specification
2. ✅ Identify all endpoints requiring JWT verification
3. ✅ Document expected error responses (401, 403, 404)
4. ✅ Plan user isolation strategy for database queries
5. ✅ Review for potential security vulnerabilities (OWASP Top 10)
6. ✅ Design responsive layouts for mobile and desktop
7. ✅ Plan optimistic UI updates and error handling
8. ✅ Verify color palette usage and accessibility contrast
9. ✅ Identify reusable components and shared patterns

### Code Review Requirements
All pull requests MUST verify:
- ✅ No hardcoded secrets or credentials
- ✅ JWT verification middleware applied to protected routes
- ✅ Database queries filter by authenticated user_id
- ✅ Error messages don't leak sensitive information
- ✅ Input validation on all user-provided data
- ✅ CORS configuration restricts origins appropriately
- ✅ Components use Tailwind utilities (no inline styles)
- ✅ Color palette strictly followed (no arbitrary colors)
- ✅ TypeScript types defined for all props and API responses
- ✅ Responsive design tested on mobile and desktop
- ✅ Keyboard navigation and focus states working
- ✅ Loading and error states properly handled

### Testing Requirements
Security-critical code MUST include:
- Unit tests for JWT verification logic
- Integration tests for authentication flows (signup, login, token refresh)
- Authorization tests verifying user isolation (attempt cross-user access)
- Negative tests for invalid tokens, expired tokens, missing tokens
- Edge cases: malformed JWT, tampered signatures, wrong algorithm

UI/UX code SHOULD include:
- Component unit tests with React Testing Library
- Accessibility tests (keyboard navigation, ARIA attributes)
- Responsive design tests (mobile, tablet, desktop viewports)
- Form validation tests (client-side and server-side)
- Optimistic UI tests (success and error rollback scenarios)

## Governance

### Amendment Process
This constitution is the authoritative source for project security and architecture decisions.

**Amendment Requirements**:
1. Proposed changes MUST be documented with rationale
2. Security-impacting changes MUST include threat model analysis
3. Version bump follows semantic versioning:
   - **MAJOR**: Breaking changes to authentication/authorization model or core architecture
   - **MINOR**: New security principles, UI standards, or technology constraints added
   - **PATCH**: Clarifications, typo fixes, non-semantic updates
4. All dependent templates and documentation MUST be updated before merge

### Compliance Verification
- All specifications (`specs/*/spec.md`) MUST reference applicable constitution principles
- All implementation plans (`specs/*/plan.md`) MUST demonstrate compliance
- All tasks (`specs/*/tasks.md`) MUST include security and UI/UX validation steps
- Code reviews MUST explicitly verify constitution compliance

### Conflict Resolution
In case of conflicts between this constitution and other documentation:
1. Constitution takes precedence over all other documents
2. Security principles CANNOT be overridden for convenience
3. UI/UX standards MAY be adapted for specific use cases with documented rationale
4. Exceptions require explicit documentation and risk acceptance
5. Temporary deviations MUST include remediation plan with timeline

**Version**: 1.1.0 | **Ratified**: 2026-01-29 | **Last Amended**: 2026-01-29
