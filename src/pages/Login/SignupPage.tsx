import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthForm } from '@/components/login-signup-page/AuthForm'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import type { SocialProvider } from '@/components/login-signup-page/SocialLoginButtons'
import { Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const META_DESCRIPTION =
  'Log in or create an account to buy or sell on the marketplace. Secure sign-in with email or social providers.'

const PROGRESS_STEPS = [
  { id: 1, label: 'Account' },
  { id: 2, label: 'Onboarding' },
]

export default function SignupPage() {
  const navigate = useNavigate()
  const { loginWithRole, signup, user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    document.title = 'Log in or Sign up | Marketplace'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', META_DESCRIPTION)
    return () => {
      document.title = 'Marketplace'
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !user) return
    const isSeller = user.role === 'seller'
    if (isSeller && !user.emailVerified) {
      navigate('/verify-email', { replace: true })
      return
    }
    if (isSeller) {
      navigate('/onboarding', { replace: true })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (data: {
    email: string
    password: string
    role: 'buyer' | 'seller'
    mode: 'login' | 'signup'
  }) => {
    setIsLoading(true)
    try {
      if (data.mode === 'signup') {
        await signup(data.email, data.password, data.role)
        toast.success('Account created. Please verify your email.')
        if (data.role === 'seller') {
          navigate('/verify-email', { replace: true })
          return
        }
        navigate('/dashboard', { replace: true })
      } else {
        const { requires2FA } = await loginWithRole(data.email, data.password, data.role)
        if (!requires2FA) {
          toast.success('Signed in successfully')
          let u: { emailVerified?: boolean; role?: string } | null = null
          try {
            const raw = sessionStorage.getItem('marketplace_user')
            if (raw) u = JSON.parse(raw)
          } catch {
            //
          }
          if (data.role === 'seller' && u && !u.emailVerified) {
            navigate('/verify-email', { replace: true })
            return
          }
          if (data.role === 'seller') {
            navigate('/onboarding', { replace: true })
          } else {
            navigate('/dashboard', { replace: true })
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: SocialProvider) => {
    toast.info(`${provider} sign-in can be configured with your auth provider.`)
  }

  if (isAuthenticated && user) {
    return (
      <div
        className={cn(
          'auth-page-bg flex min-h-[80vh] flex-col items-center justify-center px-4 py-12',
          'animate-in'
        )}
        role="status"
        aria-live="polite"
        aria-label="Redirecting"
      >
        <Card className="w-full max-w-md overflow-hidden border-0 shadow-card-hover">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Taking you to your dashboard…
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'auth-page-bg flex min-h-[80vh] flex-col items-center justify-center px-4 py-12',
        'animate-in'
      )}
    >
      <section
        className="w-full max-w-md"
        aria-labelledby="auth-heading"
      >
        <h1 id="auth-heading" className="sr-only">
          Log in or create an account
        </h1>
        <AuthForm
          defaultMode="login"
          defaultRole="buyer"
          onSubmit={handleSubmit}
          onSocialLogin={handleSocialLogin}
          isLoading={isLoading}
          showProgress={true}
          currentProgressStep={1}
          progressSteps={PROGRESS_STEPS}
        />
        <Link
          to="/forgot-password"
          className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          <Mail className="h-4 w-4" aria-hidden />
          Forgot password?
        </Link>
      </section>
    </div>
  )
}
