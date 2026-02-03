export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  completed: boolean
  scheduled_date: string | null // ISO date string
  created_at: string
  updated_at: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  scheduled_date?: string | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  completed?: boolean
  scheduled_date?: string | null
}
