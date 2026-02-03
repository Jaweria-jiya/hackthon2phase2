'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTasks } from '@/lib/hooks/useTasks'
import TaskList from '@/components/tasks/TaskList'

export default function InboxPage() {
  const { tasks: allTasks, isLoading, updateTask, deleteTask, toggleComplete } = useTasks()

  // Filter for scheduled tasks and sort by date
  const tasks = useMemo(() => {
    return allTasks
      .filter(task => task.scheduled_date && !task.completed)
      .sort((a, b) => {
        const dateA = new Date(a.scheduled_date!).getTime()
        const dateB = new Date(b.scheduled_date!).getTime()
        return dateA - dateB
      })
  }, [allTasks])

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
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
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
        <h1 className="text-3xl font-bold text-black mb-2">Inbox</h1>
        <p className="text-gray-600">All scheduled tasks</p>
      </div>

      <TaskList
        tasks={tasks}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        emptyMessage="No scheduled tasks. Go to Upcoming to schedule tasks!"
        showDate={true}
      />
    </motion.div>
  )
}
