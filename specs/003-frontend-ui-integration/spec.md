# Feature Specification: Frontend UI & API Integration Layer

**Feature Branch**: `003-frontend-ui-integration`
**Created**: 2026-01-29
**Status**: Draft
**Input**: User description: "Project: Todo Full-Stack Web Application — Spec 3: Frontend UI & API Integration Layer"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Authentication Flow (Priority: P1)

As a new user, I want to sign up and sign in to the application so that I can access my personal task list securely.

**Why this priority**: Authentication is the foundation of the entire application. Without it, users cannot access any features. This is the entry point for all user interactions.

**Independent Test**: Can be fully tested by navigating to /signup, creating an account, signing out, and signing back in via /signin. Delivers immediate value by establishing user identity and session management.

**Acceptance Scenarios**:

1. **Given** I am on the /signup page, **When** I enter valid email and password and submit, **Then** I am redirected to /tasks with an active session
2. **Given** I am on the /signin page, **When** I enter correct credentials, **Then** I am authenticated and redirected to /tasks
3. **Given** I am on the /signin page, **When** I enter incorrect credentials, **Then** I see a clear error message and remain on /signin
4. **Given** I am authenticated, **When** I click the signout button in the navbar, **Then** my session is cleared and I am redirected to /signin
5. **Given** I am not authenticated, **When** I try to access /tasks directly, **Then** I am automatically redirected to /signin

---

### User Story 2 - View Task List (Priority: P1)

As an authenticated user, I want to view all my tasks in a clean, organized list so that I can see what I need to do.

**Why this priority**: Viewing tasks is the core value proposition. Users need to see their tasks immediately after authentication to understand the application's purpose.

**Independent Test**: Can be fully tested by signing in and viewing the /tasks page. Delivers value by displaying user's task data with proper empty states and loading indicators.

**Acceptance Scenarios**:

1. **Given** I am authenticated and have no tasks, **When** I navigate to /tasks, **Then** I see an empty state with a message and a button to create my first task
2. **Given** I am authenticated and have tasks, **When** I navigate to /tasks, **Then** I see all my tasks displayed as cards with title, description, completion status, and action buttons
3. **Given** I am on /tasks, **When** the page is loading, **Then** I see skeleton loaders (not generic spinners) while data fetches
4. **Given** I am on /tasks, **When** the API request fails, **Then** I see an error message with a retry button
5. **Given** I am on /tasks, **When** I have many tasks, **Then** the page remains responsive and scrollable on mobile and desktop

---

### User Story 3 - Create New Task (Priority: P1)

As an authenticated user, I want to create a new task so that I can track things I need to do.

**Why this priority**: Task creation is essential for the application to be useful. Without it, users cannot add data to the system.

**Independent Test**: Can be fully tested by clicking "New Task" button, filling out the form, and submitting. Delivers value by allowing users to add their first task.

**Acceptance Scenarios**:

1. **Given** I am on /tasks, **When** I click the "New Task" button, **Then** I am navigated to /tasks/new
2. **Given** I am on /tasks/new, **When** I enter a title and optional description and submit, **Then** the task is created and I am redirected to /tasks with the new task visible
3. **Given** I am on /tasks/new, **When** I submit without a title, **Then** I see a validation error message
4. **Given** I am on /tasks/new, **When** I submit the form, **Then** the submit button is disabled during processing to prevent double-submission
5. **Given** I am on /tasks/new, **When** the API request fails, **Then** I see an error message with a retry option and my form data is preserved

---

### User Story 4 - Toggle Task Completion (Priority: P2)

As an authenticated user, I want to mark tasks as complete or incomplete so that I can track my progress.

**Why this priority**: Completion tracking is a core feature of task management. It provides immediate feedback and satisfaction to users.

**Independent Test**: Can be fully tested by clicking the checkbox on any task card. Delivers value by allowing users to track completion status with instant visual feedback.

**Acceptance Scenarios**:

1. **Given** I am on /tasks with an incomplete task, **When** I click the checkbox, **Then** the task is immediately marked as complete with visual feedback (optimistic UI)
2. **Given** I am on /tasks with a complete task, **When** I click the checkbox, **Then** the task is immediately marked as incomplete (optimistic UI)
3. **Given** I toggle a task's completion, **When** the API request fails, **Then** the UI reverts to the previous state and shows an error message
4. **Given** I toggle a task's completion, **When** the API request succeeds, **Then** the UI state is confirmed and no additional loading indicator appears

---

### User Story 5 - Edit Existing Task (Priority: P2)

As an authenticated user, I want to edit a task's title and description so that I can update information as my needs change.

**Why this priority**: Task editing allows users to refine and update their tasks over time, making the application more flexible and useful.

**Independent Test**: Can be fully tested by clicking "Edit" on a task card, modifying the form, and saving. Delivers value by allowing users to correct or update task information.

**Acceptance Scenarios**:

1. **Given** I am on /tasks, **When** I click the "Edit" button on a task card, **Then** I am navigated to /tasks/[id] with the form pre-filled
2. **Given** I am on /tasks/[id], **When** I modify the title or description and submit, **Then** the task is updated and I am redirected to /tasks with the updated task visible
3. **Given** I am on /tasks/[id], **When** I submit with an empty title, **Then** I see a validation error message
4. **Given** I am on /tasks/[id], **When** the API request fails, **Then** I see an error message with a retry option and my changes are preserved in the form

---

### User Story 6 - Delete Task (Priority: P2)

As an authenticated user, I want to delete tasks I no longer need so that my task list stays clean and relevant.

**Why this priority**: Task deletion is important for list maintenance but less critical than creation and viewing.

**Independent Test**: Can be fully tested by clicking "Delete" on a task card and confirming. Delivers value by allowing users to remove completed or irrelevant tasks.

**Acceptance Scenarios**:

1. **Given** I am on /tasks, **When** I click the "Delete" button on a task card, **Then** the task is immediately removed from the UI (optimistic UI)
2. **Given** I delete a task, **When** the API request fails, **Then** the task reappears in the UI and I see an error message
3. **Given** I delete a task, **When** the API request succeeds, **Then** the task remains removed and no additional confirmation is needed

---

### User Story 7 - Search and Filter Tasks (Priority: P3)

As an authenticated user, I want to search and filter my tasks so that I can quickly find specific items in a long list.

**Why this priority**: Search/filter improves usability for power users with many tasks but is not essential for MVP functionality.

**Independent Test**: Can be fully tested by entering text in the search box and observing filtered results. Delivers value by improving navigation in large task lists.

**Acceptance Scenarios**:

1. **Given** I am on /tasks with multiple tasks, **When** I type in the search box, **Then** the task list filters in real-time to show only matching tasks
2. **Given** I am on /tasks, **When** I filter by completion status (all/active/completed), **Then** only tasks matching that status are displayed
3. **Given** I have applied filters, **When** I clear the search box, **Then** all tasks are displayed again

---

### Edge Cases

- **Empty States**: What happens when a user has no tasks? Display an empty state with a clear call-to-action to create the first task.
- **Network Failures**: How does the system handle API timeouts or network errors? Show error messages with retry buttons and preserve user input.
- **Session Expiration**: What happens when a JWT token expires during use? Automatically redirect to /signin with a message about session expiration.
- **Unauthorized Access**: How does the system handle 401 responses? Automatically clear session and redirect to /signin.
- **Invalid Task IDs**: What happens when navigating to /tasks/[invalid-id]? Show a 404 error page with a link back to /tasks.
- **Long Titles/Descriptions**: How does the UI handle very long text? Truncate with ellipsis in cards, show full text in edit forms.
- **Rapid Interactions**: What happens if a user clicks multiple buttons quickly? Disable buttons during processing to prevent race conditions.
- **Mobile Viewport**: How does the UI adapt to small screens (320px+)? Use responsive Tailwind classes and touch-friendly targets (44x44px minimum).
- **Slow API Responses**: How does the UI handle slow backend responses? Show skeleton loaders immediately, timeout after 30 seconds with error message.
- **Concurrent Edits**: What happens if a task is deleted while being edited? Show error message on save attempt and redirect to /tasks.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a signup page (/signup) with email and password fields that integrates with Better Auth
- **FR-002**: System MUST provide a signin page (/signin) with email and password fields that authenticates via Better Auth
- **FR-003**: System MUST provide a protected tasks list page (/tasks) that displays all tasks for the authenticated user
- **FR-004**: System MUST provide a task creation page (/tasks/new) with title and description fields
- **FR-005**: System MUST provide a task edit page (/tasks/[id]) with pre-filled title and description fields
- **FR-006**: System MUST display a navigation bar on all authenticated pages with signout functionality
- **FR-007**: System MUST implement optimistic UI updates for task creation, update, deletion, and completion toggling
- **FR-008**: System MUST automatically redirect unauthenticated users to /signin when accessing protected routes
- **FR-009**: System MUST automatically redirect to /signin when receiving 401 Unauthorized responses from the API
- **FR-010**: System MUST display skeleton loaders (not generic spinners) during data fetching
- **FR-011**: System MUST display actionable error messages with retry options when API requests fail
- **FR-012**: System MUST validate form inputs client-side before submission (title required, max length 500 characters)
- **FR-013**: System MUST disable form submit buttons during processing to prevent double-submission
- **FR-014**: System MUST display empty state messaging when a user has no tasks
- **FR-015**: System MUST implement search/filter functionality on the tasks list page
- **FR-016**: System MUST use a centralized API client that automatically injects JWT tokens from Better Auth session
- **FR-017**: System MUST display task cards with title, description (truncated), completion checkbox, edit button, and delete button
- **FR-018**: System MUST implement responsive design that works on mobile (320px+) and desktop (1920px+)
- **FR-019**: System MUST use the custom color palette (#a47ec2 purple, #F6E3BA cream, #000000 black) consistently across all pages
- **FR-020**: System MUST use lucide-react icons consistently throughout the application

### Key Entities

- **Task**: Represents a user's todo item with title (required, max 500 chars), description (optional), completion status (boolean), timestamps (created_at, updated_at), and ownership (user_id)
- **User Session**: Represents authenticated user state managed by Better Auth, containing JWT token, user_id, and email
- **API Response**: Represents standardized response format from FastAPI backend with data payload, error messages, and HTTP status codes

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete signup and signin flows in under 30 seconds with clear visual feedback at each step
- **SC-002**: Task list page loads and displays skeleton loaders within 100ms, with actual data appearing within 2 seconds on typical network conditions
- **SC-003**: Optimistic UI updates (toggle completion, delete) feel instant with visual feedback appearing within 50ms of user action
- **SC-004**: All interactive elements (buttons, inputs, checkboxes) meet WCAG 2.1 Level AA standards with 44x44px minimum touch targets
- **SC-005**: Application works flawlessly on mobile (320px width) and desktop (1920px width) with no horizontal scrolling or layout breaks
- **SC-006**: Navigation between pages feels instant with no white screen flashes (Next.js Link prefetching)
- **SC-007**: Form validation provides real-time feedback with field-level error messages appearing within 100ms of blur event
- **SC-008**: Error states display actionable messages (not "Something went wrong") with retry buttons that successfully recover from failures
- **SC-009**: Color palette (#a47ec2, #F6E3BA, #000000) is consistently applied across all pages with no arbitrary color values
- **SC-010**: Application passes keyboard navigation audit with all interactive elements accessible via Tab key and Enter/Escape keys
- **SC-011**: Empty states provide clear guidance with call-to-action buttons that lead users to create their first task
- **SC-012**: Session expiration (401 responses) automatically redirects to /signin within 500ms with session cleared

## Technical Constraints *(mandatory)*

### Technology Stack

- **Framework**: Next.js 16+ with App Router (NOT Pages Router)
- **React**: React 18+ with Server Components and Client Components
- **Styling**: Tailwind CSS 3+ with custom color palette configuration
- **TypeScript**: Strict mode enabled for type safety
- **Authentication**: Better Auth with JWT session management
- **Icons**: lucide-react (consistent style, no mixing with other icon libraries)
- **Forms**: React Hook Form or native form handling with validation
- **State Management**: React hooks (useState, useReducer, useContext)

### Architecture Constraints

- **Component Separation**: UI components → data fetching hooks → API client layer (three-tier separation)
- **API Client**: Centralized fetch wrapper in `lib/api-client.ts` with automatic JWT injection
- **JWT Transport**: Authorization: Bearer <token> header (NOT query params or cookies for API calls)
- **File Organization**:
  - `app/` - Next.js App Router pages and layouts
  - `components/` - Reusable UI components
  - `lib/` - API client, utilities, types
  - `hooks/` - Custom React hooks for data fetching
- **No Direct Database Access**: Frontend NEVER connects to database directly
- **No Server-Side Session Storage**: All session state managed by Better Auth
- **No Inline Styles**: All CSS via Tailwind utility classes
- **No UI Logic in API Routes**: API route handlers only proxy to backend

### Color Palette (Strictly Enforced)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#a47ec2',    // Purple - CTAs, highlights, active states
        secondary: '#F6E3BA',  // Cream - backgrounds, cards, subtle accents
        neutral: '#000000',    // Black - text, borders, contrast
      }
    }
  }
}
```

### API Integration Requirements

- **Base URL**: Environment variable `NEXT_PUBLIC_API_URL` (e.g., http://localhost:4000)
- **Endpoints**:
  - `POST /api/auth/signup` - User registration
  - `POST /api/auth/login` - User authentication
  - `GET /api/{user_id}/tasks` - List all tasks
  - `POST /api/{user_id}/tasks` - Create task
  - `GET /api/{user_id}/tasks/{task_id}` - Get single task
  - `PUT /api/{user_id}/tasks/{task_id}` - Update task
  - `DELETE /api/{user_id}/tasks/{task_id}` - Delete task
  - `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion
- **Error Handling**:
  - 401 Unauthorized → Clear session, redirect to /signin
  - 403 Forbidden → Show error message (shouldn't happen with proper user_id)
  - 404 Not Found → Show "Task not found" message
  - 5xx Server Error → Show error message with retry button
  - Network Error → Show "Connection failed" with retry button

### Responsive Breakpoints

```javascript
// Tailwind default breakpoints (mobile-first)
sm: '640px'   // Small tablets
md: '768px'   // Tablets
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large desktops
```

## Explicit Exclusions *(mandatory)*

The following features are explicitly OUT OF SCOPE for this specification:

- **Dark Mode**: No theme switching or dark color palette
- **Advanced Animations**: No complex transitions, parallax, or motion effects (simple hover/focus states only)
- **Task Categories/Tags**: No categorization or tagging system
- **Task Priorities**: No priority levels or sorting by priority
- **Due Dates**: No date pickers or deadline tracking
- **Recurring Tasks**: No repeat/recurrence functionality
- **Task Attachments**: No file uploads or image attachments
- **Collaborative Features**: No task sharing or multi-user collaboration
- **Notifications**: No push notifications or email alerts
- **Offline Mode**: No service workers or offline data persistence
- **Real-Time Updates**: No WebSockets or server-sent events
- **Internationalization (i18n)**: English only, no multi-language support
- **Advanced Search**: No full-text search or complex query syntax (simple filter only)
- **Task History**: No audit log or change tracking
- **Bulk Operations**: No multi-select or batch actions
- **Keyboard Shortcuts**: No custom hotkeys (standard keyboard navigation only)
- **Export/Import**: No CSV/JSON export or import functionality
- **User Profile**: No profile editing or avatar uploads
- **Password Reset**: No forgot password flow (Better Auth handles this separately)
- **Email Verification**: No email confirmation flow (Better Auth handles this separately)

## Constitution Compliance *(mandatory)*

This specification adheres to the following constitution principles:

- **Principle I-VI**: Security-first authentication with JWT verification (handled by Better Auth and backend)
- **Principle VII**: Professional UI with strict color palette (#a47ec2, #F6E3BA, #000000) and Tailwind-only styling
- **Principle VIII**: Component architecture with clear separation (UI → data fetching → API client)
- **Principle IX**: Optimistic UI updates with skeleton loaders and actionable error messages
- **Principle X**: Responsive design (320px+) with WCAG 2.1 Level AA accessibility compliance
- **Principle XI**: Centralized API client with automatic JWT injection from Better Auth session
- **Principle XII**: Client-side and server-side form validation with field-level error display

## Dependencies *(mandatory)*

### Internal Dependencies

- **Spec 1: Authentication & Security Layer**: Better Auth must be configured and operational with JWT token issuance
- **Spec 2: Backend API & Database Layer**: All API endpoints must be implemented and accessible at `NEXT_PUBLIC_API_URL`

### External Dependencies

- **Better Auth**: JWT session management and token issuance
- **FastAPI Backend**: RESTful API endpoints for task CRUD operations
- **Neon PostgreSQL**: Database for persistent task storage (accessed via backend only)

### Environment Variables Required

```env
# Frontend (.env.local)
BETTER_AUTH_SECRET=<min-32-char-secret>
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Risk Analysis *(mandatory)*

### Technical Risks

1. **Better Auth Integration Complexity**
   - **Risk**: JWT token extraction and injection may be complex with Better Auth's session management
   - **Mitigation**: Create centralized API client wrapper that handles token extraction consistently
   - **Fallback**: If Better Auth integration is too complex, implement manual JWT storage in httpOnly cookies

2. **Optimistic UI Rollback Bugs**
   - **Risk**: Race conditions or state management errors could cause UI inconsistencies when API calls fail
   - **Mitigation**: Use React state management patterns with proper error boundaries and rollback logic
   - **Fallback**: Disable optimistic UI and use loading indicators if rollback proves unreliable

3. **Mobile Responsiveness Edge Cases**
   - **Risk**: Complex layouts may break on very small screens (320px) or unusual aspect ratios
   - **Mitigation**: Test on real devices and use mobile-first Tailwind breakpoints
   - **Fallback**: Set minimum supported width to 375px if 320px proves too constraining

### User Experience Risks

1. **Session Expiration During Use**
   - **Risk**: Users may lose unsaved form data when JWT expires and they're redirected to /signin
   - **Mitigation**: Implement form data persistence in sessionStorage before redirect
   - **Fallback**: Show warning message 5 minutes before token expiration

2. **Network Latency on Slow Connections**
   - **Risk**: Skeleton loaders may display for extended periods on slow networks, frustrating users
   - **Mitigation**: Implement 30-second timeout with clear error message and retry option
   - **Fallback**: Add offline detection and show "No connection" message immediately

## Open Questions *(optional)*

- Should task cards display creation/update timestamps? (Not specified in requirements)
- Should the search/filter state persist across page navigations? (Not specified)
- Should there be a confirmation dialog before deleting tasks? (Not specified, assuming no based on optimistic UI requirement)
- Should completed tasks be visually distinguished (strikethrough, opacity)? (Not specified, assuming yes for UX)

## Validation Checklist *(mandatory)*

- [ ] All user stories are prioritized (P1, P2, P3) and independently testable
- [ ] All functional requirements are specific and testable (FR-001 through FR-020)
- [ ] All success criteria are measurable and technology-agnostic (SC-001 through SC-012)
- [ ] Technical constraints specify exact versions and configurations
- [ ] Color palette is explicitly defined with hex codes
- [ ] API endpoints are documented with HTTP methods and paths
- [ ] Responsive breakpoints are specified with pixel values
- [ ] Explicit exclusions prevent scope creep
- [ ] Constitution compliance is verified for all 12 principles
- [ ] Dependencies on Spec 1 and Spec 2 are clearly stated
- [ ] Risk analysis includes mitigation and fallback strategies
- [ ] No [NEEDS CLARIFICATION] markers remain (all requirements are clear)
