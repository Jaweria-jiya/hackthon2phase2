import LoginForm from '@/components/auth/LoginForm'

interface SigninPageProps {
  searchParams: { expired?: string; registered?: string }
}

/**
 * Signin Page - Professional login page
 *
 * Features:
 * - Centered card layout with cream background
 * - Purple and cream color scheme
 * - Query param support for expired and registered messages
 * - Responsive design
 */
export default function SigninPage({ searchParams }: SigninPageProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border-2 border-primary">
      <h1 className="text-3xl font-bold text-black text-center mb-8">
        Sign In
      </h1>

      {searchParams.expired && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
          Your session has expired. Please sign in again.
        </div>
      )}

      {searchParams.registered && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
          Account created successfully! Please sign in.
        </div>
      )}

      <LoginForm />
    </div>
  )
}
