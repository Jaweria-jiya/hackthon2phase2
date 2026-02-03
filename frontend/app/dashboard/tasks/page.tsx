'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types/task'
import { tasksApi } from '@/lib/api'
import AddTaskForm from '@/components/tasks/AddTaskForm'
import TaskList from '@/components/tasks/TaskList'
import { toast } from 'sonner'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await tasksApi.getTasks()
      setTasks(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTask = async (title: string) => {
    try {
      const newTask = await tasksApi.createTask({ title })
      setTasks((prev) => [newTask, ...prev])
      toast.success('Task added successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add task'
      toast.error(errorMessage)
      throw err
    }
  }

  const handleToggleComplete = async (taskId: string) => {
    try {
      const updatedTask = await tasksApi.toggleComplete(taskId)
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task'
      toast.error(errorMessage)
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      await tasksApi.deleteTask(taskId)
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
      toast.success('Task deleted')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task'
      toast.error(errorMessage)
    }
  }

  const handleUpdate = async (taskId: string, title: string) => {
    try {
      const updatedTask = await tasksApi.updateTask(taskId, { title })
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      )
      toast.success('Task updated')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task'
      toast.error(errorMessage)
      throw err
    }
  }

  const incompleteTasks = tasks.filter((task) => !task.completed)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-medium">Error loading tasks</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={loadTasks}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">My Tasks</h1>
        <p className="text-gray-600">Manage your daily tasks efficiently</p>
      </div>

      <div className="mb-6">
        <AddTaskForm onAdd={handleAddTask} placeholder="Add a new task..." />
      </div>

      <TaskList
        tasks={incompleteTasks}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        emptyMessage="No tasks yet. Add one to get started!"
      />
    </div>
  )
}
