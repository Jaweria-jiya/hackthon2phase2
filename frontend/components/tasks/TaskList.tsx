'use client'

import { Task } from '@/types/task'
import TaskItem from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (taskId: string) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
  onUpdate: (taskId: string, title: string) => Promise<void>
  emptyMessage?: string
  showDate?: boolean
}

export default function TaskList({
  tasks,
  onToggleComplete,
  onDelete,
  onUpdate,
  emptyMessage = 'No tasks yet. Add one to get started!',
  showDate = false,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onUpdate={onUpdate}
          showDate={showDate}
        />
      ))}
    </div>
  )
}
