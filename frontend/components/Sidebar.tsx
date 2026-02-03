'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, CheckCircle, Inbox, CalendarDays } from 'lucide-react'
import UserMenu from './UserMenu'

const navItems = [
  {
    name: 'Today',
    href: '/dashboard/today',
    icon: Calendar,
  },
  {
    name: 'Inbox',
    href: '/dashboard/inbox',
    icon: Inbox,
  },
  {
    name: 'Upcoming',
    href: '/dashboard/upcoming',
    icon: CalendarDays,
  },
  {
    name: 'Completed',
    href: '/dashboard/completed',
    icon: CheckCircle,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-black/10 sticky top-0 h-screen flex flex-col p-4">
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out
                ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-black hover:bg-secondary hover:text-black'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Menu at bottom */}
      <div className="pt-4 border-t border-black/10">
        <UserMenu />
      </div>
    </aside>
  )
}
