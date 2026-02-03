# Data Model: Frontend UI & API Integration Layer

**Feature**: 003-frontend-ui-integration
**Date**: 2026-01-29
**Status**: Complete

## Overview

This document defines the frontend data structures, state management patterns, and data flow for the Todo application frontend. The frontend does not maintain its own database but manages in-memory state synchronized with the FastAPI backend via REST API.

## Frontend State Architecture

### State Layers

```
┌─────────────────────────────────────────┐
│         Component State (UI)            │
│  - Form inputs (controlled)             │
│  - Loading/error/success flags          │
│  - Modal open/closed state              │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Application State (Data)           │
│  - Task list (optimistic updates)       │
│  - User session (Better Auth)           │
│  - Filter/search state                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         API Client Layer                │
│  - JWT injection                        │
│  - Error handling                       │
│  - Request/response transformation      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         FastAPI Backend                 │
│  - Task CRUD operations                 │
│  - User authentication                  │
│  - Data persistence (PostgreSQL)        │
└─────────────────────────────────────────┘
```

## Core Data Entities

### Task

Represents a user's todo item.

```typescript
interface Task {
  id: string                    // UUID from backend
  user_id: string               // UUID - owner of the task
  title: string                 // Required, max 500 characters
  description: string | null    // Optional, max 1000 characters
  completed: boolean            // Completion status
  created_at: string            // ISO 8601 timestamp
  updated_at: string            // ISO 8601 timestamp (auto-updated)
}
```

**Validation Rules**:
- `title`: Required, 1-500 characters, trimmed
- `description`: Optional, 0-1000 characters, trimmed
- `completed`: Boolean, defaults to false
- `id`, `user_id`, `created_at`, `updated_at`: Read-only (set by backend)

**State Management**:
- Stored in React state as `Task[]` array
- Optimistic updates for create/update/delete/toggle operations
- Sorted by `created_at` descending (newest first)

---

### TaskCreate

Request payload for creating a new task.

```typescript
interface TaskCreate {
  title: string                 // Required, max 500 characters
  description?: string          // Optional, max 1000 characters
}
```

**Usage**: Submitted to `POST /api/{user_id}/tasks`

**Validation** (client-side):
- `title`: Required, non-empty after trim, max 500 chars
- `description`: Optional, max 1000 chars

---

### TaskUpdate

Request payload for updating an existing task.

```typescript
interface TaskUpdate {
  title?: string                // Optional, max 500 characters
  description?: string          // Optional, max 1000 characters
}
```

**Usage**: Submitted to `PUT /api/{user_id}/tasks/{task_id}`

**Validation** (client-side):
- At least one field must be provided
- `title`: If provided, non-empty after trim, max 500 chars
- `description`: If provided, max 1000 chars

**Note**: Completion status is updated via separate endpoint (`PATCH /complete`)

---

### User Session

Represents authenticated user state (managed by Better Auth).

```typescript
interface Session {
  access_token: string          // JWT token
  user: {
    id: string                  // UUID
    email: string               // User's email
    name?: string               // Optional display name
  }
  expires_at: string            // ISO 8601 timestamp
}
```

**State Management**:
- Managed by Better Auth SDK (not in React state)
- Accessed via `getSession()` helper
- Automatically refreshed by Better Auth
- Cleared on signout or 401 response

---

### API Response Types

Standard response wrappers for API calls.

```typescript
// Success response
interface ApiResponse<T> {
  data: T
  status: number
}

// Error response
interface ApiError {
  detail: string                // Human-readable error message
  status: number                // HTTP status code
  code?: string                 // Optional error code (e.g., "VALIDATION_ERROR")
}
```

**Usage**: All API client functions return `Promise<T>` or throw `ApiError`

---

## State Management Patterns

### Task List State

**Location**: `app/(dashboard)/tasks/page.tsx`

**State Structure**:
```typescript
const [tasks, setTasks] = useState<Task[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

**Data Flow**:
1. Component mounts → `setLoading(true)`
2. Fetch tasks from API → `getTasks(userId)`
3. On success → `setTasks(data)`, `setLoading(false)`
4. On error → `setError(message)`, `setLoading(false)`

**Optimistic Updates**:
```typescript
// Create task
const tempTask = { id: '-1', ...formData, completed: false, ... }
setTasks(prev => [tempTask, ...prev])  // Add immediately
try {
  const newTask = await createTask(userId, formData)
  setTasks(prev => prev.map(t => t.id === '-1' ? newTask : t))  // Replace temp
} catch (error) {
  setTasks(prev => prev.filter(t => t.id !== '-1'))  // Remove temp
  toast.error('Failed to create task')
}

// Toggle complete
setTasks(prev => prev.map(t =>
  t.id === taskId ? { ...t, completed: !t.completed } : t
))  // Update immediately
try {
  await toggleComplete(userId, taskId)
} catch (error) {
  setTasks(prev => prev.map(t =>
    t.id === taskId ? { ...t, completed: !t.completed } : t
  ))  // Rollback
  toast.error('Failed to update task')
}

// Delete task
setTasks(prev => prev.filter(t => t.id !== taskId))  // Remove immediately
try {
  await deleteTask(userId, taskId)
} catch (error) {
  // Re-fetch to restore deleted task
  const allTasks = await getTasks(userId)
  setTasks(allTasks)
  toast.error('Failed to delete task')
}
```

---

### Form State

**Location**: `components/TaskForm.tsx`

**State Structure**:
```typescript
const [title, setTitle] = useState('')
const [description, setDescription] = useState('')
const [errors, setErrors] = useState<{ title?: string; description?: string }>({})
const [isSubmitting, setIsSubmitting] = useState(false)
```

**Validation Logic**:
```typescript
function validateForm(): boolean {
  const newErrors: { title?: string; description?: string } = {}

  // Title validation
  const trimmedTitle = title.trim()
  if (!trimmedTitle) {
    newErrors.title = 'Title is required'
  } else if (trimmedTitle.length > 500) {
    newErrors.title = 'Title must be 500 characters or less'
  }

  // Description validation
  if (description.length > 1000) {
    newErrors.description = 'Description must be 1000 characters or less'
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

**Submit Flow**:
```typescript
async function handleSubmit(e: FormEvent) {
  e.preventDefault()

  if (!validateForm()) return

  setIsSubmitting(true)
  try {
    const data: TaskCreate = {
      title: title.trim(),
      description: description.trim() || undefined,
    }
    await onSubmit(data)  // Parent handles API call
    // Parent closes modal/redirects
  } catch (error) {
    toast.error(error.message)
  } finally {
    setIsSubmitting(false)
  }
}
```

---

### Search/Filter State

**Location**: `app/(dashboard)/tasks/page.tsx`

**State Structure**:
```typescript
const [searchQuery, setSearchQuery] = useState('')
const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')
```

**Filtering Logic**:
```typescript
const filteredTasks = useMemo(() => {
  let result = tasks

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    result = result.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query)
    )
  }

  // Filter by completion status
  if (filterStatus === 'active') {
    result = result.filter(t => !t.completed)
  } else if (filterStatus === 'completed') {
    result = result.filter(t => t.completed)
  }

  return result
}, [tasks, searchQuery, filterStatus])
```

**Note**: Filter state does NOT persist across navigation (resets on page leave)

---

## Data Transformation

### API Response → Frontend State

Backend returns timestamps as ISO 8601 strings. Frontend displays relative time.

```typescript
import { formatDistanceToNow } from 'date-fns'

function formatTaskDate(isoString: string): string {
  return formatDistanceToNow(new Date(isoString), { addSuffix: true })
  // Example: "2 hours ago", "3 days ago"
}
```

### Form Data → API Request

Trim whitespace and handle optional fields.

```typescript
function prepareTaskCreate(formData: { title: string; description: string }): TaskCreate {
  return {
    title: formData.title.trim(),
    description: formData.description.trim() || undefined,  // Empty string → undefined
  }
}
```

---

## Error Handling

### Error Types

```typescript
type ErrorType =
  | 'NETWORK_ERROR'       // Fetch failed (no internet, timeout)
  | 'UNAUTHORIZED'        // 401 - Invalid/expired token
  | 'FORBIDDEN'           // 403 - User doesn't own resource
  | 'NOT_FOUND'           // 404 - Resource doesn't exist
  | 'VALIDATION_ERROR'    // 400 - Invalid input
  | 'SERVER_ERROR'        // 5xx - Backend error
```

### Error State Management

```typescript
interface ErrorState {
  message: string         // User-friendly message
  type: ErrorType         // Error category
  retryable: boolean      // Can user retry?
}

// Example usage
const [error, setError] = useState<ErrorState | null>(null)

try {
  await createTask(userId, data)
} catch (err) {
  setError({
    message: 'Failed to create task. Please try again.',
    type: 'SERVER_ERROR',
    retryable: true,
  })
}
```

---

## Performance Considerations

### Memoization

Use `useMemo` for expensive computations:
```typescript
const filteredTasks = useMemo(() => {
  // Filtering logic
}, [tasks, searchQuery, filterStatus])
```

### Debouncing

Debounce search input to reduce re-renders:
```typescript
const [searchQuery, setSearchQuery] = useState('')
const debouncedSearch = useDebounce(searchQuery, 300)  // 300ms delay

const filteredTasks = useMemo(() => {
  // Use debouncedSearch instead of searchQuery
}, [tasks, debouncedSearch, filterStatus])
```

### Virtual Scrolling

For large task lists (100+ items), consider react-window:
```typescript
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={filteredTasks.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <TaskCard task={filteredTasks[index]} />
    </div>
  )}
</FixedSizeList>
```

**Decision**: Implement virtual scrolling only if performance issues observed with 100+ tasks

---

## State Persistence

### Session Storage

Persist form data before 401 redirect to prevent data loss:

```typescript
// Before redirect
sessionStorage.setItem('draft_task', JSON.stringify({ title, description }))

// After re-authentication
const draft = sessionStorage.getItem('draft_task')
if (draft) {
  const { title, description } = JSON.parse(draft)
  setTitle(title)
  setDescription(description)
  sessionStorage.removeItem('draft_task')
  toast.info('Draft restored')
}
```

### Local Storage

**Not used** - All data persisted via backend API. No offline mode.

---

## Data Flow Diagram

```
User Action (e.g., "Create Task")
         ↓
Component Event Handler
         ↓
Optimistic State Update (setTasks)
         ↓
API Client Call (createTask)
         ↓
JWT Injection (from Better Auth)
         ↓
HTTP Request to Backend
         ↓
Backend Response
         ↓
Success: Replace temp with real data
Error: Rollback optimistic update
         ↓
Toast Notification (success/error)
         ↓
UI Re-render (React state change)
```

---

## Type Definitions Summary

All TypeScript types are defined in `types/` directory:

- `types/task.ts` - Task, TaskCreate, TaskUpdate
- `types/auth.ts` - Session, User
- `types/api.ts` - ApiResponse, ApiError, ErrorType
- `types/ui.ts` - ErrorState, LoadingState

**Export Pattern**:
```typescript
// types/index.ts
export * from './task'
export * from './auth'
export * from './api'
export * from './ui'

// Usage in components
import { Task, TaskCreate, ApiError } from '@/types'
```

---

## Data Model Complete

All frontend data structures defined. No database schema needed (frontend only). Ready for API contract definition.
