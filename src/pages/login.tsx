import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InputOTP } from '@/components/ui/input-otp'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { User, ShieldCheck, Shield } from 'lucide-react'
import type { Role } from '@/types'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function Login() {
  const { loginWithRole, verify2FA, sessionPending2FA, clearPending2FA } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpError, setOtpError] = useState(false)
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role') as Role | null
  const [activeRole, setActiveRole] = useState<Role>(
    roleParam && ['seller', 'moderator', 'admin'].includes(roleParam) ? roleParam : 'seller'
  )

  useEffect(() => {
    if (roleParam && ['seller', 'moderator', 'admin'].includes(roleParam)) {
      setActiveRole(roleParam as Role)
    }
  }, [roleParam])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setOtpError(false)
    try {
      const { requires2FA } = await loginWithRole(data.email, data.password, activeRole)
      if (!requires2FA) {
        toast.success('Signed in successfully')
        navigate('/dashboard')
      }
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onVerify2FA = async () => {
    if (!sessionPending2FA || otpValue.length !== 6) {
      setOtpError(true)
      return
    }
    setIsSubmitting(true)
    setOtpError(false)
    try {
      await verify2FA(sessionPending2FA.sessionId, otpValue)
      toast.success('Signed in successfully')
      navigate('/dashboard')
    } catch {
      setOtpError(true)
      toast.error('Invalid verification code')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onBackFrom2FA = () => {
    clearPending2FA()
    setOtpValue('')
    setOtpError(false)
  }

  if (sessionPending2FA) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 animate-in">
        <Card className="w-full max-w-md border-2 border-primary/20 shadow-card-hover transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app for{' '}
              <span className="font-medium text-foreground">{sessionPending2FA.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-center block">Verification code</Label>
              <InputOTP
                value={otpValue}
                onChange={(v) => { setOtpValue(v); setOtpError(false) }}
                error={otpError}
                disabled={isSubmitting}
              />
              {otpError && (
                <p className="text-center text-sm text-destructive animate-fade-in">
                  Invalid code. Please try again.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={onVerify2FA}
                className="w-full"
                disabled={isSubmitting || otpValue.length !== 6}
              >
                {isSubmitting ? 'Verifying...' : 'Verify and sign in'}
              </Button>
              <Button variant="ghost" onClick={onBackFrom2FA} disabled={isSubmitting}>
                Back to login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 animate-in">
      <Card className="w-full max-w-md border shadow-card transition-shadow duration-300 hover:shadow-card-hover">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Log in</CardTitle>
          <CardDescription>
            Choose your role and enter your credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={activeRole}
            onValueChange={(v) => setActiveRole(v as Role)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="seller" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Seller</span>
              </TabsTrigger>
              <TabsTrigger value="moderator" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Moderator</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="seller" className="mt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...register('email')}
                    className={cn(errors.email && 'border-destructive')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    className={cn(errors.password && 'border-destructive')}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Log in'}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </TabsContent>

            <TabsContent value="moderator" className="mt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Moderators may have optional 2FA enabled for their account.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="mod-email">Email</Label>
                  <Input
                    id="mod-email"
                    type="email"
                    placeholder="moderator@example.com"
                    autoComplete="email"
                    {...register('email')}
                    className={cn(errors.email && 'border-destructive')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mod-password">Password</Label>
                  <Input
                    id="mod-password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    className={cn(errors.password && 'border-destructive')}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Log in'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin" className="mt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Admin login requires two-factor authentication for security.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    autoComplete="email"
                    {...register('email')}
                    className={cn(errors.email && 'border-destructive')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    className={cn(errors.password && 'border-destructive')}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Continue to 2FA'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
