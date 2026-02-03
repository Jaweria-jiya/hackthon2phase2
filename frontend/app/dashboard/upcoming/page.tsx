'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useTasks } from '@/lib/hooks/useTasks'
import MonthYearSelector from '@/components/MonthYearSelector'
import WeekNavigator from '@/components/WeekNavigator'
import HorizontalDateStrip from '@/components/HorizontalDateStrip'
import AddTaskForm from '@/components/tasks/AddTaskForm'
import TaskItem from '@/components/tasks/TaskItem'

export default function UpcomingPage() {
  const { tasks: allTasks, isLoading, addTask, updateTask, deleteTask, toggleComplete } = useTasks()
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Get start of week (Sunday)
    const day = today.getDay()
    const diff = today.getDate() - day
    return new Date(today.setDate(diff))
  })
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [showAddFormForDate, setShowAddFormForDate] = useState<string | null>(null)

  // Generate 7 days for the current week
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentWeekStart)
      date.setDate(currentWeekStart.getDate() + i)
      return date
    })
  }, [currentWeekStart])

  // Get tasks map for calendar indicators
  const getTasksMap = () => {
    const map = new Map<string, number>()
    allTasks.forEach((task) => {
      if (task.scheduled_date && !task.completed) {
        const count = map.get(task.scheduled_date) || 0
        map.set(task.scheduled_date, count + 1)
      }
    })
    return map
  }

  // Group tasks by date for the current week
  const groupedTasks = useMemo(() => {
    const groups: { date: Date; dateStr: string; tasks: typeof allTasks }[] = []

    weekDates.forEach((date) => {
      const dateStr = date.toISOString().split('T')[0]
      const tasksForDate = allTasks.filter(
        (task) => task.scheduled_date === dateStr && !task.completed
      )

      if (tasksForDate.length > 0 || showAddFormForDate === dateStr) {
        groups.push({ date, dateStr, tasks: tasksForDate })
      }
    })

    return groups
  }, [allTasks, weekDates, showAddFormForDate])

  // Navigation handlers
  const handlePrevWeek = () => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(currentWeekStart.getDate() - 7)
    setCurrentWeekStart(newStart)
  }

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(currentWeekStart.getDate() + 7)
    setCurrentWeekStart(newStart)
  }

  const handleToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const day = today.getDay()
    const diff = today.getDate() - day
    const weekStart = new Date(today.setDate(diff))
    setCurrentWeekStart(weekStart)
    setSelectedDate(new Date())
  }

  // Handle date selection from calendar or strip
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
    // Update week if selected date is outside current week
    const dateTime = date.getTime()
    const weekStartTime = weekDates[0].getTime()
    const weekEndTime = weekDates[6].getTime()

    if (dateTime < weekStartTime || dateTime > weekEndTime) {
      const day = date.getDay()
      const diff = date.getDate() - day
      const newWeekStart = new Date(date)
      newWeekStart.setDate(diff)
      newWeekStart.setHours(0, 0, 0, 0)
      setCurrentWeekStart(newWeekStart)
    }
  }

  // Handle adding task
  const handleAddTask = async (title: string, scheduledDate?: string | null) => {
    await addTask({ title, scheduled_date: scheduledDate })
    setShowAddFormForDate(null)
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

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return today.getTime() === checkDate.getTime()
  }

  // Format date header
  const formatDateHeader = (date: Date) => {
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
    return `${day} ${month} · ${weekday}`
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="max-w-5xl mx-auto"
    >
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Upcoming</h1>
            <MonthYearSelector
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              tasksMap={getTasksMap()}
            />
          </div>
          <WeekNavigator
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onToday={handleToday}
          />
        </div>
      </div>

      {/* Horizontal Date Strip */}
      <HorizontalDateStrip
        weekDates={weekDates}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        tasksMap={getTasksMap()}
      />

      {/* Task List Grouped by Date */}
      <div className="space-y-6">
        {groupedTasks.length > 0 ? (
          groupedTasks.map(({ date, dateStr, tasks }) => (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="space-y-3"
            >
              {/* Date Header */}
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-black">
                  {formatDateHeader(date)}
                </h2>
                {isToday(date) && (
                  <span className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                    Today
                  </span>
                )}
              </div>

              {/* Tasks for this date */}
              <div className="space-y-2">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    showDate={false}
                  />
                ))}
              </div>

              {/* Inline Add Task */}
              {showAddFormForDate === dateStr ? (
                <div className="pl-4">
                  <AddTaskForm
                    onAdd={handleAddTask}
                    placeholder={`Add a task for ${formatDateHeader(date)}...`}
                    defaultDate={dateStr}
                  />
                  <button
                    onClick={() => setShowAddFormForDate(null)}
                    className="mt-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddFormForDate(dateStr)}
                  className="flex items-center gap-2 text-gray-500 hover:text-primary transition-all duration-200 ease-in-out pl-4 py-2 group"
                >
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm font-medium">Add task</span>
                </button>
              )}
            </motion.div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-black/10 p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              No tasks scheduled for this week
            </p>
            <p className="text-gray-400 text-sm">
              Click on a date above to add tasks
            </p>
          </div>
        )}

        {/* Add task for dates without tasks */}
        {weekDates.map((date) => {
          const dateStr = date.toISOString().split('T')[0]
          const hasGroup = groupedTasks.some((g) => g.dateStr === dateStr)

          if (hasGroup || showAddFormForDate === dateStr) return null

          return (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="space-y-3"
            >
              {showAddFormForDate === dateStr && (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-black">
                      {formatDateHeader(date)}
                    </h2>
                    {isToday(date) && (
                      <span className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="pl-4">
                    <AddTaskForm
                      onAdd={handleAddTask}
                      placeholder={`Add a task for ${formatDateHeader(date)}...`}
                      defaultDate={dateStr}
                    />
                    <button
                      onClick={() => setShowAddFormForDate(null)}
                      className="mt-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
