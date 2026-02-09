import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CTAButtonsProps {
  /** Primary submit label (e.g. "Log in" or "Sign up") */
  submitLabel: string
  /** Secondary action label (e.g. "Sign up" or "Log in") */
  switchLabel: string
  onSwitch: () => void
  isLoading?: boolean
  submitDisabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function CTAButtons({
  submitLabel,
  switchLabel,
  onSwitch,
  isLoading = false,
  submitDisabled = false,
  className,
  children,
}: CTAButtonsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <Button
        type="submit"
        className={cn(
          'w-full bg-primary bg-gradient-to-r from-primary to-primary/90',
          'transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover active:scale-[0.98]',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
        disabled={isLoading || submitDisabled}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="h-4 w-4 shrink-0 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin"
              aria-hidden
            />
            Please wait...
          </span>
        ) : (
          submitLabel
        )}
      </Button>
      {children}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        className="w-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={onSwitch}
        disabled={isLoading}
      >
        {switchLabel}
      </Button>
    </div>
  )
}
