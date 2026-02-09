import * as React from 'react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type AuthFormFields = {
  email: string
  password: string
  role?: 'buyer' | 'seller'
}

const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'] as const
const STRENGTH_COLORS = [
  'bg-destructive',
  'bg-accent',
  'bg-primary',
  'bg-secondary',
] as const

function getPasswordStrength(password: string): { level: number; label: string } {
  if (!password.length) return { level: 0, label: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const level = Math.min(3, Math.floor(score / 1.5))
  return { level, label: STRENGTH_LABELS[level] }
}

export interface EmailPasswordInputsProps {
  register: UseFormRegister<AuthFormFields>
  errors: FieldErrors<AuthFormFields>
  passwordValue?: string
  emailId?: string
  passwordId?: string
  emailPlaceholder?: string
  passwordPlaceholder?: string
  showStrengthMeter?: boolean
  disabled?: boolean
  className?: string
}

export function EmailPasswordInputs({
  register,
  errors,
  passwordValue = '',
  emailId = 'auth-email',
  passwordId = 'auth-password',
  emailPlaceholder = 'you@example.com',
  passwordPlaceholder = 'Min 8 characters',
  showStrengthMeter = true,
  disabled = false,
  className,
}: EmailPasswordInputsProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const strength = getPasswordStrength(passwordValue)

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
          type="email"
          placeholder={emailPlaceholder}
          autoComplete="email"
          disabled={disabled}
          className={cn(
            'transition-colors duration-200 focus-visible:border-primary',
            errors.email && 'border-destructive animate-shake'
          )}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={passwordId}>Password</Label>
        <div className="relative">
          <Input
            id={passwordId}
            type={showPassword ? 'text' : 'password'}
            placeholder={passwordPlaceholder}
            autoComplete="new-password"
            disabled={disabled}
            className={cn(
              'pr-10 transition-colors duration-200 focus-visible:border-primary',
              errors.password && 'border-destructive animate-shake'
            )}
            {...register('password')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full min-w-10 rounded-l-none border-0"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
        {showStrengthMeter && passwordValue.length > 0 && (
          <div className="space-y-1" aria-live="polite">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all duration-300',
                    i <= strength.level ? STRENGTH_COLORS[strength.level] : 'bg-muted'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{strength.label}</p>
          </div>
        )}
      </div>
    </div>
  )
}
