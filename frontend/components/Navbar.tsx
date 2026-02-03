'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-secondary border-b border-black/10 shadow-sm">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link
            href="/dashboard/tasks"
            className="text-2xl font-bold text-black hover:opacity-70 transition-all duration-300 ease-in-out"
          >
            Todo App
          </Link>
        </div>
      </div>
    </nav>
  )
}
