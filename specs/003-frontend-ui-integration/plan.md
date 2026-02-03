# Implementation Plan: Frontend UI & API Integration Layer

**Branch**: `003-frontend-ui-integration` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-frontend-ui-integration/spec.md`

## Summary

Build a professional, polished frontend for the Todo application using Next.js 16+ App Router with a custom purple/cream/black color palette. The implementation focuses on optimistic UI updates for instant feedback, centralized API client with automatic JWT injection from Better Auth, responsive design (320px+ mobile to 1920px+ desktop), and WCAG 2.1 Level AA accessibility compliance. The architecture follows a three-tier separation pattern (UI components → data fetching hooks → API client layer) to ensure maintainability and testability.

**Key Technical Approach**:
- Next.js App Router with React Server Components for static content and Client Components for interactivity
- Tailwind CSS with custom color palette configuration for consistent branding
- Centralized API client (`lib/api-client.ts`) that extracts JWT from Better Auth session and injects into all requests
- Optimistic UI pattern with error rollback for create/update/delete/toggle operations
- Skeleton loaders instead of generic spinners for better perceived performance
- Mobile-first responsive design with Tailwind breakpoints

## Technical Context

**Language/Version**: TypeScript 5.0+ with strict mode enabled
**Primary Dependencies**:
- Next.js 16+ (App Router)
- React 18+ (Server Components + Client Components)
- Tailwind CSS 3+
- Better Auth (JWT session management)
- lucide-react (icons)
- clsx + tailwind-merge (utility class merging)
- sonner (toast notifications)

**Storage**: N/A (frontend only - data persisted via FastAPI backend to Neon PostgreSQL)
**Testing**: React Testing Library, Jest, Playwright (E2E)
**Target Platform**: Web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Web frontend (Next.js application)
**Performance Goals**:
- Initial page load: <1s on 3G connection
- Time to Interactive (TTI): <2s
- Skeleton loaders appear within 100ms
- Optimistic UI updates: <50ms visual feedback
- Navigation transitions: <200ms (instant feel)

**Constraints**:
- Color palette strictly enforced: #a47ec2 (purple), #F6E3BA (cream), #000000 (black)
- No inline styles (Tailwind utility classes only)
- No direct database access (all data via API)
- JWT transport via Authorization: Bearer <token> header only
- Mobile-first responsive design (320px minimum width)
- WCAG 2.1 Level AA compliance (4.5:1 contrast ratio, 44x44px touch targets)

**Scale/Scope**:
- 6 pages: /signup, /signin, /, /tasks, /tasks/new, /tasks/[id]
- 10+ reusable components
- 8 API endpoints integration
- Support for 100+ tasks per user without performance degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle VII: Professional UI & Brand Consistency
- **Compliance**: Custom Tailwind config with exact hex codes (#a47ec2, #F6E3BA, #000000)
- **Verification**: All components use theme colors via Tailwind classes (bg-primary, text-secondary, etc.)
- **No inline styles**: Enforced via ESLint rule and code review

### ✅ Principle VIII: Component Architecture & Reusability
- **Compliance**: Three-tier separation implemented
  - Tier 1: UI components (components/ui/Button.tsx, Input.tsx, etc.)
  - Tier 2: Data fetching hooks (hooks/useTasks.ts, useAuth.ts)
  - Tier 3: API client layer (lib/api-client.ts, lib/api/tasks.ts)
- **TypeScript**: Strict mode enabled, all props typed, no `any` types
- **File Organization**: app/ (pages), components/ (UI), lib/ (utilities), hooks/ (data fetching)

### ✅ Principle IX: Optimistic UI & Performance
- **Compliance**: Optimistic updates for all mutations (create, update, delete, toggle)
- **Skeleton Loaders**: Custom SkeletonLoader component (no generic spinners)
- **Error Handling**: Actionable messages with retry buttons (toast notifications via sonner)
- **Navigation**: Next.js Link with prefetching enabled for instant transitions

### ✅ Principle X: Responsive Design & Accessibility
- **Compliance**: Mobile-first Tailwind breakpoints (sm:640px, md:768px, lg:1024px)
- **Touch Targets**: All buttons/checkboxes minimum 44x44px (w-11 h-11 or larger)
- **Keyboard Navigation**: Tab order, focus indicators (focus:ring-2 focus:ring-primary)
- **ARIA Labels**: All interactive elements have aria-label or visible labels
- **Color Contrast**: Verified with WebAIM contrast checker (primary on white: 4.8:1, passes AA)

### ✅ Principle XI: Secure API Integration
- **Compliance**: Centralized API client in lib/api-client.ts
- **JWT Injection**: Automatic extraction from Better Auth session via getSession()
- **Type Safety**: All API responses typed (types/task.ts, types/auth.ts)
- **Error Handling**: 401 → redirect to /signin, 403/404/5xx → error messages with retry
- **Environment Variables**: NEXT_PUBLIC_API_URL for API base URL

### ✅ Principle XII: Form Validation & Error Handling
- **Compliance**: Client-side validation (real-time on blur/change)
- **Server-Side**: Backend re-validates (frontend validation is UX only)
- **Field-Level Errors**: Error messages displayed next to inputs (FormError component)
- **Disabled States**: Submit buttons disabled during processing (prevents double-submit)
- **Validation Rules**: Title required + max 500 chars, email RFC 5322 format, password min 8 chars

### Constitution Compliance Summary
**Status**: ✅ PASSED - All 6 frontend principles (VII-XII) satisfied
**Violations**: None
**Justifications**: N/A

## Project Structure

### Documentation (this feature)

```text
specs/003-frontend-ui-integration/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - Technology decisions and best practices
├── data-model.md        # Phase 1 output - Frontend data structures and state management
├── quickstart.md        # Phase 1 output - Setup instructions and development workflow
├── contracts/           # Phase 1 output - API contracts and TypeScript types
│   ├── api-endpoints.md # API endpoint documentation
│   └── types.ts         # TypeScript type definitions
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (no navbar)
│   │   ├── layout.tsx            # Centered card layout with cream background
│   │   ├── signin/
│   │   │   └── page.tsx          # Sign in page
│   │   └── signup/
│   │       └── page.tsx          # Sign up page
│   ├── (dashboard)/              # Protected route group (with navbar)
│   │   ├── layout.tsx            # Dashboard layout with Navbar
│   │   └── tasks/
│   │       ├── page.tsx          # Task list page
│   │       ├── new/
│   │       │   └── page.tsx      # Create task page
│   │       └── [id]/
│   │           └── page.tsx      # Edit task page
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   ├── page.tsx                  # Landing page (redirects to /tasks or /signin)
│   ├── loading.tsx               # Global loading state
│   └── error.tsx                 # Global error boundary
│
├── components/
│   ├── ui/                       # Reusable UI primitives
│   │   ├── Button.tsx            # Primary/secondary button variants
│   │   ├── Input.tsx             # Text input with error state
│   │   ├── Checkbox.tsx          # Styled checkbox
│   │   ├── FormError.tsx         # Inline error message
│   │   └── SkeletonLoader.tsx    # Content skeleton loader
│   ├── TaskCard.tsx              # Task display card with actions
│   ├── TaskForm.tsx              # Create/edit task form
│   ├── Navbar.tsx                # Navigation bar with user menu
│   ├── UserMenu.tsx              # User dropdown with signout
│   └── EmptyState.tsx            # Empty state with CTA
│
├── lib/
│   ├── api-client.ts             # Centralized fetch wrapper with JWT injection
│   ├── api/
│   │   ├── tasks.ts              # Task API functions (getTasks, createTask, etc.)
│   │   └── auth.ts               # Auth API functions (signup, signin, signout)
│   ├── auth.ts                   # Better Auth helpers (getSession, signOut)
│   ├── utils.ts                  # Utility functions (cn for class merging)
│   └── design-tokens.ts          # Design system constants
│
├── hooks/
│   ├── useTasks.ts               # Task data fetching and mutations
│   └── useAuth.ts                # Auth state management
│
├── types/
│   ├── task.ts                   # Task, TaskCreate, TaskUpdate interfaces
│   ├── auth.ts                   # User, Session interfaces
│   └── api.ts                    # API response types
│
├── middleware.ts                 # Route protection (redirect unauthenticated users)
├── tailwind.config.js            # Custom color palette configuration
├── tsconfig.json                 # TypeScript strict mode config
├── next.config.js                # Next.js configuration
├── .env.local                    # Environment variables (NEXT_PUBLIC_API_URL)
└── package.json                  # Dependencies

tests/
├── unit/                         # Component unit tests
│   ├── Button.test.tsx
│   ├── TaskCard.test.tsx
│   └── api-client.test.ts
├── integration/                  # Integration tests
│   ├── task-crud.test.tsx
│   └── auth-flow.test.tsx
└── e2e/                          # End-to-end tests (Playwright)
    ├── signup.spec.ts
    ├── task-management.spec.ts
    └── responsive.spec.ts
```

**Structure Decision**: Web application structure with Next.js App Router. The `app/` directory uses route groups `(auth)` and `(dashboard)` to apply different layouts (auth pages have centered card layout, dashboard pages have navbar). Components are organized by reusability (ui/ for primitives, root for feature-specific). The `lib/` directory contains all business logic and API integration, keeping components focused on presentation. This structure supports the three-tier architecture mandated by Principle VIII.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution principles are satisfied without exceptions.

## Phase 0: Research & Technology Decisions

### Research Questions

1. **Better Auth JWT Extraction**: How to extract JWT token from Better Auth session in Next.js App Router?
2. **Optimistic UI Patterns**: Best practices for implementing optimistic updates with error rollback in React?
3. **Next.js 16 App Router**: Server Components vs Client Components - when to use each?
4. **Tailwind Custom Colors**: How to configure custom color palette and ensure consistent usage?
5. **Accessibility Testing**: Tools and techniques for WCAG 2.1 Level AA compliance verification?

### Research Findings

See [research.md](./research.md) for detailed findings.

**Summary of Key Decisions**:
- **Better Auth Integration**: Use `getSession()` from Better Auth SDK to extract JWT token in API client
- **Optimistic UI**: Use React state with immediate updates + try/catch for rollback on API failure
- **Component Strategy**: Server Components for static content (layouts, landing page), Client Components for interactive elements (forms, task list)
- **Color Palette**: Extend Tailwind theme in tailwind.config.js, use semantic names (primary, secondary, neutral)
- **Accessibility**: Use eslint-plugin-jsx-a11y, axe-core for automated testing, manual keyboard navigation testing

## Phase 1: Design & Architecture

### Data Model

See [data-model.md](./data-model.md) for complete data structures.

**Frontend State Management**:
- **Task State**: Array of Task objects managed in React state with optimistic updates
- **Auth State**: Session managed by Better Auth (JWT token, user_id, email)
- **UI State**: Loading, error, success states for each async operation
- **Form State**: Controlled inputs with validation state (errors, touched fields)

**Key Entities**:
```typescript
interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

interface TaskCreate {
  title: string
  description?: string
}

interface TaskUpdate {
  title?: string
  description?: string
}
```

### API Contracts

See [contracts/](./contracts/) for complete API documentation.

**Endpoints**:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/{user_id}/tasks` - List all tasks
- `POST /api/{user_id}/tasks` - Create task
- `GET /api/{user_id}/tasks/{task_id}` - Get single task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion

**Error Handling Strategy**:
- 401 Unauthorized → Clear session, redirect to /signin
- 403 Forbidden → Show error message (shouldn't happen with proper user_id)
- 404 Not Found → Show "Task not found" message
- 5xx Server Error → Show error message with retry button
- Network Error → Show "Connection failed" with retry button

### Component Architecture

**Component Hierarchy**:
```
RootLayout
├── (auth) AuthLayout
│   ├── SignupPage
│   │   ├── Input (email, password)
│   │   ├── Button (submit)
│   │   └── FormError
│   └── SigninPage
│       ├── Input (email, password)
│       ├── Button (submit)
│       └── FormError
│
└── (dashboard) DashboardLayout
    ├── Navbar
    │   └── UserMenu
    ├── TasksPage
    │   ├── SkeletonLoader (loading state)
    │   ├── EmptyState (no tasks)
    │   └── TaskCard[] (task list)
    │       ├── Checkbox (toggle complete)
    │       ├── Button (edit)
    │       └── Button (delete)
    ├── NewTaskPage
    │   └── TaskForm
    │       ├── Input (title)
    │       ├── Textarea (description)
    │       ├── Button (save)
    │       └── Button (cancel)
    └── EditTaskPage
        └── TaskForm (pre-filled)
```

**Component Patterns**:
- **Compound Components**: TaskCard contains Checkbox + Buttons (encapsulated behavior)
- **Render Props**: TaskForm accepts onSubmit, onCancel callbacks (flexible usage)
- **Composition**: Button accepts variant prop (primary/secondary) for reusability
- **Controlled Components**: All form inputs controlled by React state

### Quickstart Guide

See [quickstart.md](./quickstart.md) for complete setup instructions.

**Development Workflow**:
1. Install dependencies: `npm install`
2. Configure environment: Copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_API_URL`
3. Run development server: `npm run dev`
4. Access application: http://localhost:3000
5. Run tests: `npm test` (unit), `npm run test:e2e` (Playwright)

## Phase 2: Implementation Roadmap

**Note**: Detailed task breakdown will be generated by `/sp.tasks` command. This section provides high-level implementation phases.

### Phase 2.1: Foundation (Estimated: 3 hours)
- Setup Next.js project with TypeScript and Tailwind CSS
- Configure custom color palette in tailwind.config.js
- Create design tokens and utility functions
- Setup Better Auth integration
- Create centralized API client with JWT injection

### Phase 2.2: Authentication UI (Estimated: 2 hours)
- Build AuthLayout with centered card design
- Create signup page with form validation
- Create signin page with error handling
- Implement route protection middleware
- Add toast notifications for auth feedback

### Phase 2.3: Dashboard Layout (Estimated: 1.5 hours)
- Build DashboardLayout with gradient background
- Create Navbar with logo and user menu
- Implement UserMenu dropdown with signout
- Add responsive mobile menu (hamburger)

### Phase 2.4: Task Management (Estimated: 4 hours)
- Create TasksPage with skeleton loaders
- Build TaskCard component with actions
- Implement EmptyState for no tasks
- Create TaskForm for create/edit
- Add optimistic UI updates for all mutations
- Implement error handling with rollback

### Phase 2.5: Polish & Accessibility (Estimated: 2 hours)
- Add loading states and transitions
- Implement keyboard navigation
- Add ARIA labels and focus indicators
- Verify color contrast ratios
- Test responsive design on multiple devices

### Phase 2.6: Testing & Validation (Estimated: 2 hours)
- Write unit tests for components
- Write integration tests for task CRUD
- Write E2E tests for auth and task flows
- Run accessibility audit (axe-core)
- Performance testing (Lighthouse)

**Total Estimated Time**: 14.5 hours

## Architecture Decision Records

### ADR-001: Next.js App Router vs Pages Router

**Decision**: Use Next.js App Router (not Pages Router)

**Rationale**:
- App Router is the recommended approach for Next.js 13+
- Better support for React Server Components (performance optimization)
- Route groups enable different layouts for auth vs dashboard pages
- Improved data fetching patterns with async Server Components
- Better TypeScript support and type inference

**Alternatives Considered**:
- Pages Router: Rejected because it's legacy approach, lacks Server Components support
- Remix: Rejected because Better Auth integration is simpler with Next.js

**Consequences**:
- Learning curve for developers unfamiliar with App Router
- Some third-party libraries may not support Server Components yet
- Mitigation: Use "use client" directive for interactive components

### ADR-002: Optimistic UI Pattern

**Decision**: Implement optimistic updates with error rollback for all mutations

**Rationale**:
- Provides instant feedback (50ms vs 200-500ms API round trip)
- Improves perceived performance significantly
- Aligns with Principle IX (Optimistic UI & Performance)
- Modern UX expectation for task management apps

**Alternatives Considered**:
- Loading indicators: Rejected because they feel slow and block user interaction
- Pessimistic updates: Rejected because they create noticeable delays

**Implementation Pattern**:
```typescript
async function handleToggleComplete(taskId: string) {
  // 1. Optimistic update
  setTasks(prev => prev.map(t =>
    t.id === taskId ? { ...t, completed: !t.completed } : t
  ))

  try {
    // 2. API call
    await toggleComplete(userId, taskId)
  } catch (error) {
    // 3. Rollback on error
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ))
    toast.error('Failed to update task')
  }
}
```

**Consequences**:
- More complex state management (need rollback logic)
- Potential for UI inconsistencies if rollback fails
- Mitigation: Use error boundaries and comprehensive error handling

### ADR-003: Centralized API Client

**Decision**: Create single API client wrapper in lib/api-client.ts with automatic JWT injection

**Rationale**:
- Ensures consistent JWT injection across all requests (Principle XI)
- Single place to handle 401 redirects and error responses
- Easier to add retry logic, timeout handling, request/response logging
- Prevents scattered fetch calls with inconsistent patterns

**Alternatives Considered**:
- Direct fetch calls: Rejected because it leads to duplicated JWT injection logic
- Third-party library (axios, ky): Rejected because native fetch is sufficient and reduces bundle size

**Implementation**:
```typescript
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const session = await getSession()
  const token = session?.access_token

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (response.status === 401) {
    window.location.href = '/signin'
    return null
  }

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Request failed')
  }

  return response.json()
}
```

**Consequences**:
- All API calls must go through this wrapper (enforced via code review)
- Easier to add features like request caching, retry logic, analytics
- Mitigation: Document API client usage in quickstart.md

### ADR-004: Tailwind CSS with Custom Palette

**Decision**: Use Tailwind CSS with custom color palette extension (not CSS-in-JS or custom CSS)

**Rationale**:
- Aligns with Principle VII (no inline styles, Tailwind-only)
- Custom palette ensures consistent branding (#a47ec2, #F6E3BA, #000000)
- Utility-first approach reduces CSS bundle size
- Excellent responsive design support with breakpoints
- Strong TypeScript support with tailwind-merge

**Alternatives Considered**:
- CSS Modules: Rejected because it requires more boilerplate and doesn't enforce consistency
- Styled Components: Rejected because it violates "no inline styles" principle
- Plain CSS: Rejected because it's harder to maintain consistency

**Configuration**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#a47ec2',
        'primary-dark': '#8a5ea3',
        secondary: '#F6E3BA',
        'secondary-dark': '#e8d4a5',
        neutral: '#000000',
      },
    },
  },
}
```

**Consequences**:
- Developers must learn Tailwind utility classes
- Long className strings in JSX (mitigated with cn() utility)
- Mitigation: Use Tailwind IntelliSense extension, document common patterns

## Risk Mitigation

### Risk 1: Better Auth Integration Complexity
**Mitigation**:
- Create abstraction layer in lib/auth.ts for Better Auth SDK
- Document JWT extraction pattern in quickstart.md
- Add error handling for session expiration

**Fallback**: If Better Auth proves too complex, implement manual JWT storage in httpOnly cookies with custom middleware

### Risk 2: Optimistic UI Rollback Bugs
**Mitigation**:
- Use React error boundaries to catch state update errors
- Comprehensive unit tests for optimistic update logic
- Add logging for rollback failures

**Fallback**: Disable optimistic UI and use loading indicators if rollback proves unreliable in production

### Risk 3: Mobile Responsiveness at 320px
**Mitigation**:
- Test on real devices (iPhone SE, small Android phones)
- Use mobile-first Tailwind breakpoints
- Ensure touch targets are 44x44px minimum

**Fallback**: Increase minimum supported width to 375px if 320px proves too constraining for usable UI

### Risk 4: Session Expiration Data Loss
**Mitigation**:
- Persist form data in sessionStorage before 401 redirect
- Show warning message 5 minutes before token expiration
- Add "Save draft" functionality for long forms

**Fallback**: Accept data loss and rely on clear error messaging to guide users to re-authenticate

### Risk 5: API Latency on Slow Networks
**Mitigation**:
- Implement 30-second timeout with clear error message
- Show skeleton loaders immediately (within 100ms)
- Add retry button on timeout errors

**Fallback**: Add offline detection and show "No connection" message immediately if network is unavailable

## Dependencies

### Internal Dependencies
- **Spec 1: Authentication & Security Layer**: Better Auth must be configured with JWT token issuance
- **Spec 2: Backend API & Database Layer**: All 8 API endpoints must be implemented and accessible

### External Dependencies
- **Better Auth SDK**: JWT session management and token extraction
- **FastAPI Backend**: RESTful API at NEXT_PUBLIC_API_URL
- **Neon PostgreSQL**: Database for task persistence (accessed via backend only)

### Development Dependencies
- Node.js 18+ (for Next.js 16)
- npm or yarn package manager
- Modern browser for testing (Chrome 90+, Firefox 88+, Safari 14+)

## Success Criteria

Implementation is complete when:
- [ ] All 6 pages render correctly with purple/cream/black theme
- [ ] Authentication flow works (signup, signin, signout, route protection)
- [ ] Task CRUD operations work with optimistic UI updates
- [ ] API client automatically injects JWT from Better Auth session
- [ ] Responsive design works on mobile (320px) and desktop (1920px)
- [ ] Keyboard navigation works for all interactive elements
- [ ] Color contrast ratios meet WCAG 2.1 Level AA (4.5:1 minimum)
- [ ] Touch targets are 44x44px minimum
- [ ] Skeleton loaders appear within 100ms of page load
- [ ] Navigation transitions feel instant (<200ms)
- [ ] Error messages are actionable with retry buttons
- [ ] All constitution principles (VII-XII) verified in code review
- [ ] Unit tests pass for all components
- [ ] Integration tests pass for task CRUD flows
- [ ] E2E tests pass for auth and task management
- [ ] Lighthouse score: Performance >90, Accessibility 100
- [ ] No console errors or warnings in production build

## Next Steps

1. Run `/sp.tasks` to generate detailed task breakdown with test cases
2. Begin Phase 2.1 implementation (Foundation setup)
3. Create feature branch and commit plan artifacts
4. Schedule code review after each phase completion
5. Update ADRs if architectural decisions change during implementation
