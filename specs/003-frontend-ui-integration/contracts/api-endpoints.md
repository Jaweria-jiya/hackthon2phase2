# API Contracts: Frontend UI & API Integration Layer

**Feature**: 003-frontend-ui-integration
**Date**: 2026-01-29
**Status**: Complete

## Overview

This document defines the REST API contracts between the Next.js frontend and FastAPI backend. All endpoints require JWT authentication except signup and signin.

**Base URL**: `http://localhost:4000` (configurable via `NEXT_PUBLIC_API_URL`)

**Authentication**: JWT token in `Authorization: Bearer <token>` header

---

## Authentication Endpoints

### POST /api/auth/signup

Create a new user account.

**Authentication**: None required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Request Schema**:
```typescript
interface SignupRequest {
  email: string      // RFC 5322 format
  password: string   // Minimum 8 characters
}
```

**Success Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2026-01-29T10:30:00Z"
}
```

**Error Responses**:
- **400 Bad Request**: Invalid email format or password too short
  ```json
  {
    "detail": "Password must be at least 8 characters"
  }
  ```
- **409 Conflict**: Email already registered
  ```json
  {
    "detail": "Email already registered"
  }
  ```

**Frontend Implementation**:
```typescript
// lib/api/auth.ts
export async function signup(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Signup failed')
  }

  return response.json()
}
```

---

### POST /api/auth/login

Authenticate user and receive JWT token.

**Authentication**: None required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Request Schema**:
```typescript
interface LoginRequest {
  email: string
  password: string
}
```

**Success Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

**Error Responses**:
- **401 Unauthorized**: Invalid credentials
  ```json
  {
    "detail": "Invalid email or password"
  }
  ```

**Frontend Implementation**:
```typescript
// lib/api/auth.ts
export async function login(email: string, password: string): Promise<Session> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Login failed')
  }

  return response.json()
}
```

---

## Task Endpoints

All task endpoints require JWT authentication and validate that `user_id` in URL matches authenticated user.

### GET /api/{user_id}/tasks

List all tasks for authenticated user.

**Authentication**: Required (JWT)

**Path Parameters**:
- `user_id` (string, UUID): Must match authenticated user's ID

**Query Parameters**: None

**Success Response** (200 OK):
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-01-29T10:30:00Z",
    "updated_at": "2026-01-29T10:30:00Z"
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Finish project",
    "description": null,
    "completed": true,
    "created_at": "2026-01-28T15:20:00Z",
    "updated_at": "2026-01-29T09:15:00Z"
  }
]
```

**Response Schema**:
```typescript
type GetTasksResponse = Task[]
```

**Error Responses**:
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: user_id doesn't match authenticated user

**Frontend Implementation**:
```typescript
// lib/api/tasks.ts
export async function getTasks(userId: string): Promise<Task[]> {
  return apiRequest(`/api/${userId}/tasks`)
}
```

---

### POST /api/{user_id}/tasks

Create a new task.

**Authentication**: Required (JWT)

**Path Parameters**:
- `user_id` (string, UUID): Must match authenticated user's ID

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Request Schema**:
```typescript
interface CreateTaskRequest {
  title: string         // Required, 1-500 characters
  description?: string  // Optional, max 1000 characters
}
```

**Success Response** (201 Created):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-29T10:30:00Z",
  "updated_at": "2026-01-29T10:30:00Z"
}
```

**Error Responses**:
- **400 Bad Request**: Invalid input (title missing or too long)
  ```json
  {
    "detail": "Title is required and must be 500 characters or less"
  }
  ```
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: user_id doesn't match authenticated user

**Frontend Implementation**:
```typescript
// lib/api/tasks.ts
export async function createTask(userId: string, data: TaskCreate): Promise<Task> {
  return apiRequest(`/api/${userId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
```

---

### GET /api/{user_id}/tasks/{task_id}

Get a single task by ID.

**Authentication**: Required (JWT)

**Path Parameters**:
- `user_id` (string, UUID): Must match authenticated user's ID
- `task_id` (string, UUID): Task ID

**Success Response** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-29T10:30:00Z",
  "updated_at": "2026-01-29T10:30:00Z"
}
```

**Error Responses**:
- **401 Unauthorized**: Missing or invalid JWT token
- **404 Not Found**: Task doesn't exist or doesn't belong to user
  ```json
  {
    "detail": "Task not found"
  }
  ```

**Frontend Implementation**:
```typescript
// lib/api/tasks.ts
export async function getTask(userId: string, taskId: string): Promise<Task> {
  return apiRequest(`/api/${userId}/tasks/${taskId}`)
}
```

---

### PUT /api/{user_id}/tasks/{task_id}

Update task title and/or description.

**Authentication**: Required (JWT)

**Path Parameters**:
- `user_id` (string, UUID): Must match authenticated user's ID
- `task_id` (string, UUID): Task ID

**Request Body**:
```json
{
  "title": "Buy groceries and cook dinner",
  "description": "Milk, eggs, bread, chicken"
}
```

**Request Schema**:
```typescript
interface UpdateTaskRequest {
  title?: string        // Optional, 1-500 characters
  description?: string  // Optional, max 1000 characters
}
```

**Note**: At least one field must be provided. Completion status is NOT updated via this endpoint.

**Success Response** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries and cook dinner",
  "description": "Milk, eggs, bread, chicken",
  "completed": false,
  "created_at": "2026-01-29T10:30:00Z",
  "updated_at": "2026-01-29T11:45:00Z"
}
```

**Error Responses**:
- **400 Bad Request**: Invalid input or no fields provided
- **401 Unauthorized**: Missing or invalid JWT token
- **404 Not Found**: Task doesn't exist or doesn't belong to user

**Frontend Implementation**:
```typescript
// lib/api/tasks.ts
export async function updateTask(
  userId: string,
  taskId: string,
  data: TaskUpdate
): Promise<Task> {
  return apiRequest(`/api/${userId}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
```

---

### DELETE /api/{user_id}/tasks/{task_id}

Delete a task.

**Authentication**: Required (JWT)

**Path Parameters**:
- `user_id` (string, UUID): Must match authenticated user's ID
- `task_id` (string, UUID): Task ID

**Success Response** (204 No Content):
No response body.

**Error Responses**:
- **401 Unauthorized**: Missing or invalid JWT token
- **404 Not Found**: Task doesn't exist or doesn't belong to user

**Frontend Implementation**:
```typescript
// lib/api/tasks.ts
export async function deleteTask(userId: string, taskId: string): Promise<void> {
  await apiRequest(`/api/${userId}/tasks/${taskId}`, {
    method: 'DELETE',
  })
}
```

---

### PATCH /api/{user_id}/tasks/{task_id}/complete

Toggle task completion status.

**Authentication**: Required (JWT)

**Path Parameters**:
- `user_id` (string, UUID): Must match authenticated user's ID
- `task_id` (string, UUID): Task ID

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2026-01-29T10:30:00Z",
  "updated_at": "2026-01-29T12:00:00Z"
}
```

**Behavior**: Toggles `completed` field (true → false, false → true)

**Error Responses**:
- **401 Unauthorized**: Missing or invalid JWT token
- **404 Not Found**: Task doesn't exist or doesn't belong to user

**Frontend Implementation**:
```typescript
// lib/api/tasks.ts
export async function toggleComplete(userId: string, taskId: string): Promise<Task> {
  return apiRequest(`/api/${userId}/tasks/${taskId}/complete`, {
    method: 'PATCH',
  })
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "detail": "Human-readable error message"
}
```

**HTTP Status Codes**:
- **400 Bad Request**: Invalid input (validation error)
- **401 Unauthorized**: Missing, invalid, or expired JWT token
- **403 Forbidden**: Valid token but insufficient permissions
- **404 Not Found**: Resource doesn't exist or user lacks permission
- **409 Conflict**: Resource already exists (e.g., duplicate email)
- **500 Internal Server Error**: Backend error
- **503 Service Unavailable**: Backend temporarily unavailable

---

## API Client Implementation

### Centralized API Client

```typescript
// lib/api-client.ts
import { getSession } from '@/lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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

  // Handle 401 - redirect to signin
  if (response.status === 401) {
    window.location.href = '/signin'
    throw new Error('Unauthorized')
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  // Parse JSON response
  const data = await response.json()

  // Handle error responses
  if (!response.ok) {
    throw new Error(data.detail || 'Request failed')
  }

  return data
}
```

### Usage Example

```typescript
// Component
import { getTasks, createTask, toggleComplete } from '@/lib/api/tasks'

async function loadTasks() {
  try {
    const tasks = await getTasks(userId)
    setTasks(tasks)
  } catch (error) {
    toast.error(error.message)
  }
}

async function handleCreate(data: TaskCreate) {
  try {
    const newTask = await createTask(userId, data)
    setTasks(prev => [newTask, ...prev])
    toast.success('Task created!')
  } catch (error) {
    toast.error(error.message)
  }
}
```

---

## Request/Response Examples

### Complete Task Creation Flow

**1. User fills form**:
```typescript
const formData = {
  title: 'Buy groceries',
  description: 'Milk, eggs, bread'
}
```

**2. Frontend validates**:
```typescript
if (!formData.title.trim()) {
  setError('Title is required')
  return
}
```

**3. Frontend sends request**:
```http
POST /api/550e8400-e29b-41d4-a716-446655440000/tasks HTTP/1.1
Host: localhost:4000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**4. Backend responds**:
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-29T10:30:00Z",
  "updated_at": "2026-01-29T10:30:00Z"
}
```

**5. Frontend updates state**:
```typescript
setTasks(prev => [newTask, ...prev])
toast.success('Task created!')
```

---

## API Contract Testing

### Contract Tests

Verify API responses match expected schema:

```typescript
// tests/integration/api-contracts.test.ts
import { getTasks, createTask } from '@/lib/api/tasks'

describe('API Contracts', () => {
  it('GET /api/{user_id}/tasks returns Task[]', async () => {
    const tasks = await getTasks(userId)

    expect(Array.isArray(tasks)).toBe(true)
    tasks.forEach(task => {
      expect(task).toHaveProperty('id')
      expect(task).toHaveProperty('title')
      expect(task).toHaveProperty('completed')
      expect(typeof task.completed).toBe('boolean')
    })
  })

  it('POST /api/{user_id}/tasks returns created Task', async () => {
    const data = { title: 'Test task', description: 'Test' }
    const task = await createTask(userId, data)

    expect(task.id).toBeDefined()
    expect(task.title).toBe('Test task')
    expect(task.completed).toBe(false)
  })
})
```

---

## API Contracts Complete

All 8 endpoints documented with request/response schemas, error handling, and frontend implementation examples. Ready for implementation.
