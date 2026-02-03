import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

/**
 * Reusable Button component with variants and loading states
 *
 * Variants:
 * - primary: Purple background (default)
 * - secondary: Cream background
 *
 * Features:
 * - Loading state with text change
 * - Disabled state with reduced opacity
 * - Smooth transitions
 * - Accessible with proper ARIA attributes
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      loading = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          'w-full font-semibold py-3 px-4 rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variant === 'primary' && [
            'bg-primary text-white',
            'hover:bg-primary-dark',
            'focus:ring-primary',
            'disabled:hover:bg-primary',
          ],
          variant === 'secondary' && [
            'bg-secondary text-black border-2 border-black',
            'hover:bg-secondary-dark',
            'focus:ring-secondary',
            'disabled:hover:bg-secondary',
          ],
          className
        )}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
