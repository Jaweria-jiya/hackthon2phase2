'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types/task'
import { tasksApi } from '@/lib/api'
import TaskList from '@/components/tasks/TaskList'
import { toast } from 'sonner'

export default function CompletedPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      const data = await tasksApi.getTasks()
      const completedTasks = data.filter((task) => task.completed)
      setTasks(completedTasks)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleComplete = async (taskId: string) => {
    // Optimistic update - remove from completed immediately
    const originalTasks = [...tasks]
    setTasks((prev) => prev.filter((task) => task.id !== taskId))

    try {
      await tasksApi.toggleComplete(taskId)
      toast.success('Task marked as incomplete')
    } catch (err) {
      // Revert on error
      setTasks(originalTasks)
      toast.error('Failed to update task')
    }
  }

  const handleDelete = async (taskId: string) => {
    // Optimistic update
    const originalTasks = [...tasks]
    setTasks((prev) => prev.filter((task) => task.id !== taskId))

    try {
      await tasksApi.deleteTask(taskId)
      toast.success('Task deleted')
    } catch (err) {
      // Revert on error
      setTasks(originalTasks)
      toast.error('Failed to delete task')
    }
  }

  const handleUpdate = async (taskId: string, title: string) => {
    // Optimistic update
    const originalTasks = [...tasks]
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, title } : task))
    )

    try {
      const updatedTask = await tasksApi.updateTask(taskId, { title })
      // Update with server response
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      )
      toast.success('Task updated')
    } catch (err) {
      // Revert on error
      setTasks(originalTasks)
      toast.error('Failed to update task')
      throw err
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Completed</h1>
        <p className="text-gray-600">Tasks you've finished</p>
      </div>

      <TaskList
        tasks={tasks}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        emptyMessage="No completed tasks yet. Complete some tasks to see them here!"
        showDate={true}
      />
    </div>
  )
}
