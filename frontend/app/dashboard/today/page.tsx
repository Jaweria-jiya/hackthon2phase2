'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTasks } from '@/lib/hooks/useTasks'
import AddTaskForm from '@/components/tasks/AddTaskForm'
import TaskList from '@/components/tasks/TaskList'

export default function TodayPage() {
  const { tasks: allTasks, isLoading, addTask, updateTask, deleteTask, toggleComplete } = useTasks()

  // Filter for today's tasks
  const tasks = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    return allTasks.filter((task) => {
      if (!task.scheduled_date) return false
      return task.scheduled_date === todayStr
    })
  }, [allTasks])

  // Filter for incomplete tasks
  const incompleteTasks = useMemo(() => {
    return tasks.filter((task) => !task.completed)
  }, [tasks])

  // Handle adding task with today's date
  const handleAddTask = async (title: string) => {
    const today = new Date().toISOString().split('T')[0]
    await addTask({ title, scheduled_date: today })
  }

  // Handle updating task
  const handleUpdate = async (taskId: string, title: string) => {
    await updateTask(taskId, { title })
  }

  // Handle deleting task
  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId)
  }

  // Handle toggling completion
  const handleToggleComplete = async (taskId: string) => {
    await toggleComplete(taskId)
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Today</h1>
        <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="mb-6">
        <AddTaskForm onAdd={handleAddTask} placeholder="Add a task for today..." />
      </div>

      <TaskList
        tasks={incompleteTasks}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        emptyMessage="No tasks scheduled for today. Add one to get started!"
      />
    </motion.div>
  )
}
