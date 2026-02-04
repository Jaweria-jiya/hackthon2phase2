'use client'

import { useState } from 'react'
import { Task } from '@/types/task'
import { Check, Trash2, Edit2, Calendar, X } from 'lucide-react'

interface TaskItemProps {
  task: Task
  onToggleComplete: (taskId: string) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
  onUpdate: (taskId: string, title: string) => Promise<void>
  showDate?: boolean
}

export default function TaskItem({
  task,
  onToggleComplete,
  onDelete,
  onUpdate,
  showDate = false,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleToggleComplete = async () => {
    try {
      await onToggleComplete(task.id)
    } catch (error) {
      // Error handled by parent component
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      await onDelete(task.id)
    } catch (error) {
      // Error handled by parent component
      setIsDeleting(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || editTitle === task.title || isSaving) {
      setIsEditing(false)
      setEditTitle(task.title)
      return
    }

    setIsSaving(true)
    try {
      await onUpdate(task.id, editTitle.trim())
      setIsEditing(false)
    } catch (error) {
      // Error handled by parent component
      setEditTitle(task.title)
    } finally {
      // Keep disabled for 500ms to prevent double-submit
      setTimeout(() => setIsSaving(false), 500)
    }
  }

  const handleCancelEdit = () => {
    if (isSaving) return
    setIsEditing(false)
    setEditTitle(task.title)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString('en-US', { month: 'short' })
    return `${day} ${month}`
  }

  return (
    <div
      className={`
        group bg-white rounded-lg p-4 border border-black/10 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out
        ${isDeleting ? 'opacity-50 scale-95' : ''}
        ${task.completed ? 'bg-gray-50' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={`
            flex-shrink-0 w-6 h-6 rounded border-2 transition-all duration-200 ease-in-out mt-0.5
            ${
              task.completed
                ? 'bg-primary border-primary'
                : 'border-black/30 hover:border-primary'
            }
            flex items-center justify-center
          `}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && <Check className="w-4 h-4 text-white" />}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full px-3 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 ease-in-out"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 ease-in-out font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Save changes"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-white border-2 border-black/20 text-black rounded-lg hover:bg-secondary hover:border-black/30 transition-all duration-200 ease-in-out font-medium text-sm disabled:opacity-50"
                  aria-label="Cancel edit"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p
                className={`
                  text-black font-medium break-words
                  ${task.completed ? 'line-through text-gray-500' : ''}
                `}
              >
                {task.title}
              </p>
              {showDate && task.scheduled_date && (
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(task.scheduled_date)}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-500 hover:text-primary transition-all duration-200 ease-in-out rounded hover:bg-secondary"
              aria-label="Edit task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-gray-500 hover:text-red-600 transition-all duration-200 ease-in-out rounded hover:bg-red-50 disabled:opacity-50"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
