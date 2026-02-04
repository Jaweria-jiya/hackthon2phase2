import { apiClient } from '../api-client'

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  completed?: boolean
}

/**
 * Get all tasks for a user
 */
export async function getTasks(userId: string): Promise<Task[]> {
  const response = await apiClient(`/api/${userId}/tasks`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch tasks')
  }

  return response.json()
}

/**
 * Create a new task
 */
export async function createTask(
  userId: string,
  data: CreateTaskRequest
): Promise<Task> {
  const response = await apiClient(`/api/${userId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to create task')
  }

  return response.json()
}

/**
 * Update a task
 */
export async function updateTask(
  userId: string,
  taskId: string,
  data: UpdateTaskRequest
): Promise<Task> {
  const response = await apiClient(`/api/${userId}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to update task')
  }

  return response.json()
}

/**
 * Delete a task
 */
export async function deleteTask(
  userId: string,
  taskId: string
): Promise<void> {
  const response = await apiClient(`/api/${userId}/tasks/${taskId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to delete task')
  }
}

/**
 * Toggle task completion status
 */
export async function toggleComplete(
  userId: string,
  taskId: string
): Promise<Task> {
  const response = await apiClient(`/api/${userId}/tasks/${taskId}/complete`, {
    method: 'PATCH',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to toggle task')
  }

  return response.json()
}
