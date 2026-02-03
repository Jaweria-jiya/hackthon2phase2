import SignupForm from '@/components/auth/SignupForm'

/**
 * Signup Page - Professional account creation page
 *
 * Features:
 * - Centered card layout with cream background
 * - Purple and cream color scheme
 * - Responsive design
 */
export default function SignupPage() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border-2 border-primary">
      <h1 className="text-3xl font-bold text-black text-center mb-8">
        Create Account
      </h1>
      <SignupForm />
    </div>
  )
}
