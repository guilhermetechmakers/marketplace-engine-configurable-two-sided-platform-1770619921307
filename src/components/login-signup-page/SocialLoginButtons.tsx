import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type SocialProvider = 'google' | 'apple' | 'facebook'

export interface SocialLoginButtonsProps {
  /** Which providers to show. Default: all three. */
  providers?: SocialProvider[]
  onProviderClick?: (provider: SocialProvider) => void
  disabled?: boolean
  className?: string
}

const PROVIDER_CONFIG: Record<
  SocialProvider,
  { label: string; icon: string; ariaLabel: string }
> = {
  google: { label: 'Google', icon: 'G', ariaLabel: 'Sign in with Google' },
  apple: { label: 'Apple', icon: '', ariaLabel: 'Sign in with Apple' },
  facebook: { label: 'Facebook', icon: 'f', ariaLabel: 'Sign in with Facebook' },
}

export function SocialLoginButtons({
  providers = ['google', 'apple', 'facebook'],
  onProviderClick,
  disabled = false,
  className,
}: SocialLoginButtonsProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-center text-sm text-muted-foreground">Or continue with</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {providers.map((provider) => {
          const config = PROVIDER_CONFIG[provider]
          return (
            <Button
              key={provider}
              type="button"
              variant="secondary"
              className="h-10 transition-all duration-200 hover:scale-[1.02] hover:shadow-card active:scale-[0.98]"
              onClick={() => onProviderClick?.(provider)}
              disabled={disabled}
              aria-label={config.ariaLabel}
            >
              <span className="font-semibold">{config.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
