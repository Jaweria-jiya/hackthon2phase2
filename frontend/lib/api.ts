import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  if (!token) {
    throw new Error('No authentication token found')
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

function getUserId(): string {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null

  if (!userId) {
    throw new Error('No user ID found')
  }

  return userId
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`

    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.detail || errorJson.message || errorMessage
    } catch {
      errorMessage = errorText || errorMessage
    }

    throw new ApiError(response.status, errorMessage)
  }

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export const tasksApi = {
  async getTasks(): Promise<Task[]> {
    const userId = getUserId()
    const response = await fetch(`${API_URL}/api/${userId}/tasks`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return handleResponse<Task[]>(response)
  },

  async getTask(taskId: string): Promise<Task> {
    const userId = getUserId()
    const response = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return handleResponse<Task>(response)
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const userId = getUserId()
    const response = await fetch(`${API_URL}/api/${userId}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    })
    return handleResponse<Task>(response)
  },

  async updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
    const userId = getUserId()
    const response = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    })
    return handleResponse<Task>(response)
  },

  async deleteTask(taskId: string): Promise<void> {
    const userId = getUserId()
    const response = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    await handleResponse<void>(response)
  },

  async toggleComplete(taskId: string): Promise<Task> {
    const userId = getUserId()
    const response = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    })
    return handleResponse<Task>(response)
  },
}
