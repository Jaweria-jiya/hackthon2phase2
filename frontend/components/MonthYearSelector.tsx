'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Calendar from './Calendar'

interface MonthYearSelectorProps {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  tasksMap: Map<string, number>
}

export default function MonthYearSelector({
  selectedDate,
  onSelectDate,
  tasksMap,
}: MonthYearSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentDate = selectedDate || new Date()
  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleDateSelect = (date: Date) => {
    onSelectDate(date)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-lg text-gray-600 hover:text-primary transition-all duration-200 ease-in-out"
        aria-label="Select month and year"
      >
        <span>{monthYear}</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute top-full left-0 mt-2 z-50 shadow-lg rounded-lg"
          >
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              tasksMap={tasksMap}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
