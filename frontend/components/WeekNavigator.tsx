'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeekNavigatorProps {
  onPrevWeek: () => void
  onNextWeek: () => void
  onToday: () => void
}

export default function WeekNavigator({
  onPrevWeek,
  onNextWeek,
  onToday,
}: WeekNavigatorProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToday}
        className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 ease-in-out"
        aria-label="Go to today"
      >
        Today
      </button>
      <div className="flex items-center gap-1">
        <button
          onClick={onPrevWeek}
          className="p-2 hover:bg-primary/10 rounded-lg transition-all duration-200 ease-in-out"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-5 h-5 text-black" />
        </button>
        <button
          onClick={onNextWeek}
          className="p-2 hover:bg-primary/10 rounded-lg transition-all duration-200 ease-in-out"
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5 text-black" />
        </button>
      </div>
    </div>
  )
}
