import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

/**
 * Reusable Input component with error states and accessibility
 *
 * Features:
 * - White background with purple focus ring
 * - Error state with red border
 * - Accessible with proper ARIA attributes
 * - Supports all standard input props
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, type = 'text', disabled, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-black mb-2"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'w-full px-4 py-2 bg-white border rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-black/20 hover:border-black/30',
            className
          )}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-red-600 text-sm mt-1"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
