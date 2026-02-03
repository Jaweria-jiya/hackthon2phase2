import { ReactNode } from 'react'

/**
 * Auth Layout - Shared layout for authentication pages
 *
 * Features:
 * - Full-screen cream background
 * - Centered card layout
 * - Responsive padding
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
