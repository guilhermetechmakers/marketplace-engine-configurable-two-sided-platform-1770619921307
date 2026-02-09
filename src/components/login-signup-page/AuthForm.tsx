import * as React from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmailPasswordInputs, type AuthFormFields } from './EmailPasswordInputs'
import { SocialLoginButtons, type SocialProvider } from './SocialLoginButtons'
import { CTAButtons } from './CTAButtons'
import { LegalText } from './LegalText'
import { ProgressIndicators } from './ProgressIndicators'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['buyer', 'seller']).optional(),
})

const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  role: z.enum(['buyer', 'seller']),
})

export type AuthMode = 'login' | 'signup'

export interface AuthFormSubmitPayload {
  email: string
  password: string
  role: 'buyer' | 'seller'
  mode: AuthMode
}

export interface AuthFormProps {
  defaultMode?: AuthMode
  defaultRole?: 'buyer' | 'seller'
  onSubmit: (data: AuthFormSubmitPayload) => Promise<void>
  onSocialLogin?: (provider: SocialProvider) => void
  isLoading?: boolean
  /** For seller flow: show onboarding progress (e.g. step 1 = auth, step 2 = onboarding) */
  showProgress?: boolean
  currentProgressStep?: number
  progressSteps?: { id: number; label: string; done?: boolean }[]
}

export function AuthForm({
  defaultMode = 'login',
  defaultRole = 'buyer',
  onSubmit,
  onSocialLogin,
  isLoading = false,
  showProgress = false,
  currentProgressStep = 1,
  progressSteps = [
    { id: 1, label: 'Account' },
    { id: 2, label: 'Onboarding' },
  ],
}: AuthFormProps) {
  const [mode, setMode] = React.useState<AuthMode>(defaultMode)
  const [role, setRole] = React.useState<'buyer' | 'seller'>(defaultRole)

  const loginForm = useForm<AuthFormFields & { role?: 'buyer' | 'seller' }>({
    resolver: zodResolver(loginSchema) as Resolver<AuthFormFields & { role?: 'buyer' | 'seller' }>,
    defaultValues: { email: '', password: '', role: defaultRole },
  })

  const signupForm = useForm<AuthFormFields>({
    resolver: zodResolver(signupSchema) as Resolver<AuthFormFields>,
    defaultValues: { email: '', password: '', role: defaultRole },
  })

  const onLoginSubmit = async (data: AuthFormFields) => {
    await onSubmit({
      email: data.email,
      password: data.password,
      role: (data.role as 'buyer' | 'seller') || 'buyer',
      mode: 'login',
    })
  }

  const onSignupSubmit = async (data: AuthFormFields) => {
    await onSubmit({
      email: data.email,
      password: data.password,
      role: (data.role as 'buyer' | 'seller') || 'buyer',
      mode: 'signup',
    })
  }

  return (
    <Card className="w-full max-w-md border-2 border-primary/10 shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="text-center">
        {showProgress && (
          <div className="mb-4">
            <ProgressIndicators
              steps={progressSteps}
              currentStepId={currentProgressStep}
            />
          </div>
        )}
        <CardTitle className="text-2xl font-bold tracking-tight">
          {mode === 'login' ? 'Log in' : 'Create account'}
        </CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Choose your role and enter your credentials'
            : 'Choose your role and sign up'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as AuthMode)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="login"
              className="gap-2 transition-all duration-200 data-[state=active]:shadow-sm"
            >
              Log in
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="gap-2 transition-all duration-200 data-[state=active]:shadow-sm"
            >
              Sign up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6 space-y-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">I want to</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRole('buyer')
                    loginForm.setValue('role', 'buyer')
                  }}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                    role === 'buyer'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <User className="h-5 w-5" />
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('seller')
                    loginForm.setValue('role', 'seller')
                  }}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                    role === 'seller'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <Store className="h-5 w-5" />
                  Sell
                </button>
              </div>
              <input type="hidden" {...loginForm.register('role')} />
            </div>
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-4"
            >
              <EmailPasswordInputs
                register={loginForm.register}
                errors={loginForm.formState.errors}
                showStrengthMeter={false}
                disabled={isLoading}
              />
              <CTAButtons
                submitLabel="Log in"
                switchLabel="Create an account"
                onSwitch={() => setMode('signup')}
                isLoading={isLoading}
              />
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-6 space-y-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">I want to</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRole('buyer')
                    signupForm.setValue('role', 'buyer')
                  }}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                    role === 'buyer'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <User className="h-5 w-5" />
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('seller')
                    signupForm.setValue('role', 'seller')
                  }}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                    role === 'seller'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <Store className="h-5 w-5" />
                  Sell
                </button>
              </div>
              <input type="hidden" {...signupForm.register('role')} />
            </div>
            <form
              onSubmit={signupForm.handleSubmit(onSignupSubmit)}
              className="space-y-4"
            >
              <EmailPasswordInputs
                register={signupForm.register}
                errors={signupForm.formState.errors}
                passwordValue={signupForm.watch('password')}
                showStrengthMeter={true}
                disabled={isLoading}
              />
              <CTAButtons
                submitLabel="Sign up"
                switchLabel="Already have an account? Log in"
                onSwitch={() => setMode('login')}
                isLoading={isLoading}
              />
            </form>
          </TabsContent>
        </Tabs>

        <SocialLoginButtons
          providers={['google', 'apple', 'facebook']}
          onProviderClick={onSocialLogin}
          disabled={isLoading}
        />
        <LegalText />
      </CardContent>
    </Card>
  )
}
