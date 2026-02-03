'use client'

interface HorizontalDateStripProps {
  weekDates: Date[]
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  tasksMap: Map<string, number>
}

export default function HorizontalDateStrip({
  weekDates,
  selectedDate,
  onSelectDate,
  tasksMap,
}: HorizontalDateStripProps) {
  const isToday = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return today.getTime() === checkDate.getTime()
  }

  const isSelected = (date: Date) => {
    if (!selectedDate) return false
    const selected = new Date(selectedDate)
    selected.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return selected.getTime() === checkDate.getTime()
  }

  const getTaskCount = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return tasksMap.get(dateStr) || 0
  }

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const formatDate = (date: Date) => {
    return date.getDate()
  }

  return (
    <div className="mb-8">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {weekDates.map((date, index) => {
          const selected = isSelected(date)
          const today = isToday(date)
          const taskCount = getTaskCount(date)

          return (
            <button
              key={index}
              onClick={() => onSelectDate(date)}
              className={`
                flex-shrink-0 flex flex-col items-center justify-center
                min-w-[80px] h-20 rounded-xl
                transition-all duration-200 ease-in-out
                ${
                  selected
                    ? 'bg-primary text-white shadow-md scale-105 border-2 border-primary'
                    : 'bg-white text-black hover:bg-secondary border-2 border-transparent'
                }
                ${today && !selected ? 'border-2 border-primary' : ''}
              `}
              aria-label={`${formatDay(date)} ${formatDate(date)}, ${taskCount} tasks`}
            >
              <span
                className={`text-xs font-medium uppercase tracking-wide ${
                  selected ? 'text-white/80' : 'text-gray-600'
                }`}
              >
                {formatDay(date)}
              </span>
              <span
                className={`text-2xl font-bold mt-1 ${
                  selected ? 'text-white' : 'text-black'
                }`}
              >
                {formatDate(date)}
              </span>
              {taskCount > 0 && (
                <span
                  className={`
                  text-xs mt-1 px-2 py-0.5 rounded-full font-medium
                  ${
                    selected
                      ? 'bg-white/20 text-white'
                      : 'bg-primary/10 text-primary'
                  }
                `}
                >
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
