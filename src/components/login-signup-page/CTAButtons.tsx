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
        className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover active:scale-[0.98]"
        disabled={isLoading || submitDisabled}
        aria-busy={isLoading}
      >
        {isLoading ? 'Please wait...' : submitLabel}
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
        className="w-full"
        onClick={onSwitch}
        disabled={isLoading}
      >
        {switchLabel}
      </Button>
    </div>
  )
}
