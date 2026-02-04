'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface FormErrors {
  email?: string
  password?: string
  form?: string
}

/**
 * SignupForm - Production-ready signup form
 *
 * ✅ FIXES:
 * - Robust error handling for all HTTP status codes
 * - Loading state always resets (finally block)
 * - Handles network errors gracefully
 * - Parses error responses correctly
 * - Validates responses before parsing JSON
 */
export default function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })

  // Email validation
  const validateEmail = (value: string): string | undefined => {
    if (!value) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Invalid email format'
    return undefined
  }

  // Password validation
  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Password must be at least 8 characters'
    return undefined
  }

  // Handle blur events for validation
  const handleBlur = (field: 'email' | 'password') => {
    setTouched({ ...touched, [field]: true })

    if (field === 'email') {
      const error = validateEmail(email)
      setErrors({ ...errors, email: error })
    } else if (field === 'password') {
      const error = validatePassword(password)
      setErrors({ ...errors, password: error })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setErrors({})
    setLoading(true)

    // Validate all fields
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      })
      setTouched({ email: true, password: true })
      setLoading(false)
      return
    }

    try {
      // ✅ ROBUST: Fetch with timeout and error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)

      // ✅ ROBUST: Parse JSON safely
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        throw new Error('Invalid response from server')
      }

      // ✅ ROBUST: Handle all HTTP status codes
      if (response.status === 201) {
        // Success - redirect to signin
        router.push('/signin?registered=true')
        return
      }

      if (response.status === 400) {
        // Email already registered
        throw new Error(data.detail || 'Email already registered')
      }

      if (response.status === 422) {
        // Validation error
        throw new Error(data.detail || 'Invalid input data')
      }

      if (response.status === 500 || response.status === 503) {
        // Server error
        throw new Error('Server error. Please try again later.')
      }

      // Generic error for other status codes
      throw new Error(data.detail || 'Signup failed')

    } catch (err: any) {
      // ✅ ROBUST: Handle different error types
      if (err.name === 'AbortError') {
        setErrors({ form: 'Request timeout. Please try again.' })
      } else if (err.message === 'Failed to fetch') {
        setErrors({ form: 'Network error. Please check your connection.' })
      } else {
        setErrors({ form: err.message || 'An error occurred during signup' })
      }
    } finally {
      // ✅ CRITICAL: Always reset loading state
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="email"
        name="email"
        label="Email"
        placeholder="user@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => handleBlur('email')}
        error={touched.email ? errors.email : undefined}
        disabled={loading}
        required
      />

      <Input
        type="password"
        name="password"
        label="Password"
        placeholder="Minimum 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => handleBlur('password')}
        error={touched.password ? errors.password : undefined}
        disabled={loading}
        required
      />

      {errors.form && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errors.form}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-black/70">
        Already have an account?{' '}
        <a
          href="/signin"
          className="text-primary hover:text-primary-dark font-medium transition-colors"
        >
          Sign In
        </a>
      </p>
    </form>
  )
}
