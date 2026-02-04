'use client'

import { useState, useEffect, useCallback } from 'react'
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task'
import { tasksApi } from '@/lib/api'
import { toast } from 'sonner'

/**
 * Shared task management hook with cross-page synchronization.
 *
 * Features:
 * - Centralized task state management
 * - CRUD operations with optimistic updates
 * - Cross-page synchronization via CustomEvent API
 * - Automatic error handling and rollback
 * - Toast notifications for user feedback
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load tasks on mount
  const loadTasks = useCallback(async () => {
    try {
      const data = await tasksApi.getTasks()
      setTasks(data)
    } catch (error) {
      toast.error('Failed to load tasks')
      console.error('Load tasks error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Broadcast changes to other pages
  const broadcastChange = (type: 'add' | 'update' | 'delete', task: Task) => {
    window.dispatchEvent(
      new CustomEvent('tasks-changed', { detail: { type, task } })
    )
  }

  // Listen for changes from other pages
  useEffect(() => {
    const handleChange = (e: Event) => {
      const { type, task } = (e as CustomEvent).detail

      if (type === 'add') {
        setTasks(prev => [task, ...prev])
      } else if (type === 'update') {
        setTasks(prev => prev.map(t => t.id === task.id ? task : t))
      } else if (type === 'delete') {
        setTasks(prev => prev.filter(t => t.id !== task.id))
      }
    }

    window.addEventListener('tasks-changed', handleChange)
    return () => window.removeEventListener('tasks-changed', handleChange)
  }, [])

  // Add task with optimistic update
  const addTask = async (input: CreateTaskInput) => {
    const tempTask: Task = {
      id: `temp-${Date.now()}`,
      user_id: 'temp',
      title: input.title,
      description: input.description || null,
      completed: false,
      scheduled_date: input.scheduled_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setTasks(prev => [tempTask, ...prev])

    try {
      const newTask = await tasksApi.createTask(input)
      setTasks(prev => prev.map(t => t.id === tempTask.id ? newTask : t))
      broadcastChange('add', newTask)
      toast.success('Task added')
      return newTask
    } catch (error) {
      setTasks(prev => prev.filter(t => t.id !== tempTask.id))
      toast.error('Failed to add task')
      console.error('Add task error:', error)
      throw error
    }
  }

  // Update task
  const updateTask = async (taskId: string, input: UpdateTaskInput) => {
    const originalTasks = [...tasks]
    const taskToUpdate = tasks.find(t => t.id === taskId)
    if (!taskToUpdate) return

    const updatedTask = { ...taskToUpdate, ...input, updated_at: new Date().toISOString() }
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t))

    try {
      const result = await tasksApi.updateTask(taskId, input)
      setTasks(prev => prev.map(t => t.id === taskId ? result : t))
      broadcastChange('update', result)
      toast.success('Task updated')
    } catch (error) {
      setTasks(originalTasks)
      toast.error('Failed to update task')
      console.error('Update task error:', error)
      throw error
    }
  }

  // Delete task
  const deleteTask = async (taskId: string) => {
    const originalTasks = [...tasks]
    const taskToDelete = tasks.find(t => t.id === taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))

    try {
      await tasksApi.deleteTask(taskId)
      if (taskToDelete) broadcastChange('delete', taskToDelete)
      toast.success('Task deleted')
    } catch (error) {
      setTasks(originalTasks)
      toast.error('Failed to delete task')
      console.error('Delete task error:', error)
      throw error
    }
  }

  // Toggle complete
  const toggleComplete = async (taskId: string) => {
    const originalTasks = [...tasks]
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ))

    try {
      const result = await tasksApi.toggleComplete(taskId)
      setTasks(prev => prev.map(t => t.id === taskId ? result : t))
      broadcastChange('update', result)
      toast.success(result.completed ? 'Task completed' : 'Task reopened')
    } catch (error) {
      setTasks(originalTasks)
      toast.error('Failed to update task')
      console.error('Toggle complete error:', error)
      throw error
    }
  }

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    loadTasks,
  }
}
