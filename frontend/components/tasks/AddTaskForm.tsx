'use client'

import { useState, FormEvent, useEffect } from 'react'
import { Plus } from 'lucide-react'

interface AddTaskFormProps {
  onAdd: (title: string, scheduledDate?: string | null) => Promise<void>
  placeholder?: string
  showDatePicker?: boolean
  defaultDate?: string | null
}

export default function AddTaskForm({
  onAdd,
  placeholder = 'Add a new task...',
  showDatePicker = false,
  defaultDate = null,
}: AddTaskFormProps) {
  const [title, setTitle] = useState('')
  const [scheduledDate, setScheduledDate] = useState<string>(defaultDate || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!title.trim() || isDisabled || isSubmitting) return

    // Disable for 800ms to prevent double-entry
    setIsDisabled(true)
    setIsSubmitting(true)

    try {
      await onAdd(title.trim(), showDatePicker && scheduledDate ? scheduledDate : null)
      setTitle('')
      if (!defaultDate) {
        setScheduledDate('')
      }
    } catch (error) {
      // Error handled by parent component
    } finally {
      setIsSubmitting(false)
      // Keep disabled for 800ms to prevent double-entry
      setTimeout(() => {
        setIsDisabled(false)
      }, 800)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          className="flex-1 px-4 py-3 bg-white border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={isDisabled || !title.trim()}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>

      {showDatePicker && (
        <input
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          disabled={isDisabled}
          className="w-full px-4 py-2 bg-white border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        />
      )}
    </form>
  )
}
