import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { User, Store } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  role: z.enum(['buyer', 'seller']),
})

type FormData = z.infer<typeof schema>

export function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as import('react-hook-form').Resolver<FormData>,
    defaultValues: { role: 'buyer' },
  })

  const role = watch('role')

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await signup(data.email, data.password, data.role)
      toast.success('Account created')
      navigate(data.role === 'seller' ? '/onboarding' : '/dashboard')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 animate-in">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Choose your role and enter your details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>I want to</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('role', 'buyer')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors',
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
                  onClick={() => setValue('role', 'seller')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-colors',
                    role === 'seller'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted'
                  )}
                >
                  <Store className="h-5 w-5" />
                  Sell
                </button>
              </div>
              <input type="hidden" {...register('role')} />
            </div>
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
                autoComplete="new-password"
                placeholder="Min 8 characters"
                {...register('password')}
                className={cn(errors.password && 'border-destructive')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
