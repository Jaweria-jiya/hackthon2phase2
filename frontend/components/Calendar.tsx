'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarProps {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  tasksMap: Map<string, number>
}

export default function Calendar({ selectedDate, onSelectDate, tasksMap }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const generateCalendarDays = () => {
    const days = []
    const totalDays = daysInMonth(currentMonth)
    const firstDay = firstDayOfMonth(currentMonth)

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= totalDays; day++) {
      days.push(day)
    }

    return days
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    )
  }

  const getTaskCount = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return tasksMap.get(dateStr) || 0
  }

  const handleDayClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onSelectDate(date)
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border border-black/10 p-6 min-w-[320px]">
      {/* Header with only arrow navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-primary/10 rounded-lg transition-all duration-200 ease-in-out"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-black" />
        </button>

        <h3 className="text-lg font-semibold text-black">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-primary/10 rounded-lg transition-all duration-200 ease-in-out"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-3 mb-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-3">
        {generateCalendarDays().map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const taskCount = getTaskCount(day)
          const selected = isSelected(day)
          const today = isToday(day)

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-200 ease-in-out
                ${selected ? 'bg-primary text-white shadow-md' : 'hover:bg-primary/20'}
                ${today && !selected ? 'ring-2 ring-primary ring-inset' : ''}
              `}
            >
              <span className="text-sm font-medium">{day}</span>
              {taskCount > 0 && (
                <span className={`text-xs mt-0.5 ${selected ? 'text-white' : 'text-primary'}`}>
                  {taskCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
