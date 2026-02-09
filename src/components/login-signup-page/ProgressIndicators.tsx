import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface ProgressStep {
  id: number
  label: string
  done?: boolean
}

export interface ProgressIndicatorsProps {
  steps: ProgressStep[]
  currentStepId: number
  className?: string
}

export function ProgressIndicators({
  steps,
  currentStepId,
  className,
}: ProgressIndicatorsProps) {
  return (
    <nav
      className={cn('flex items-center justify-between gap-2', className)}
      aria-label="Seller onboarding progress"
    >
      {steps.map((step, index) => {
        const isActive = step.id === currentStepId
        const isDone = step.done ?? step.id < currentStepId
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-300',
                  isDone && !isActive &&
                    'border-primary bg-primary text-primary-foreground',
                  isActive && 'border-primary bg-primary/10 text-primary',
                  !isDone && !isActive && 'border-muted text-muted-foreground'
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {isDone && !isActive ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  'mt-1 hidden text-xs font-medium sm:block',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 rounded transition-colors duration-300',
                  isDone ? 'bg-primary' : 'bg-muted'
                )}
                aria-hidden
              />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
