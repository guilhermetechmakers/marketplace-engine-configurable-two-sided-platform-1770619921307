import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface LegalTextProps {
  className?: string
  /** Optional base path for legal pages. Default uses /legal/:slug */
  termsSlug?: string
  privacySlug?: string
}

export function LegalText({
  className,
  termsSlug = 'terms',
  privacySlug = 'privacy',
}: LegalTextProps) {
  return (
    <p
      className={cn(
        'text-center text-xs text-muted-foreground leading-relaxed',
        className
      )}
    >
      By continuing, you agree to our{' '}
      <Link
        to={`/legal/${termsSlug}`}
        className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        Terms of Service
      </Link>{' '}
      and{' '}
      <Link
        to={`/legal/${privacySlug}`}
        className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        Privacy Policy
      </Link>
      .
    </p>
  )
}
