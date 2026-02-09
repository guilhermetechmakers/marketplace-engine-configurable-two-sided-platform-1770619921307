import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthForm } from '@/components/login-signup-page/AuthForm'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import type { SocialProvider } from '@/components/login-signup-page/SocialLoginButtons'
import { Mail } from 'lucide-react'

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
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 animate-in">
        <div className="h-8 w-8 animate-pulse rounded-full bg-primary/20" aria-hidden />
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12 animate-in">
      <AuthForm
        defaultMode="login"
        defaultRole="buyer"
        onSubmit={handleSubmit}
        onSocialLogin={handleSocialLogin}
        isLoading={isLoading}
        showProgress={false}
        currentProgressStep={1}
        progressSteps={PROGRESS_STEPS}
      />
      <Link
        to="/forgot-password"
        className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        <Mail className="h-4 w-4" />
        Forgot password?
      </Link>
    </div>
  )
}
