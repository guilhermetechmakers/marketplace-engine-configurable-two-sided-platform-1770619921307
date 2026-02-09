import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export function VerifyEmail() {
  useEffect(() => {
    document.title = 'Verify your email | Marketplace'
  }, [])

  const handleResend = () => {
    toast.success('Verification email sent. Check your inbox.')
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 animate-in">
      <Card className="w-full max-w-md border-2 border-primary/10 shadow-card transition-all duration-300 hover:shadow-card-hover">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            We sent a verification link to your email. Click the link to verify
            your account and continue to seller onboarding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleResend}
            variant="secondary"
            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Resend verification email
          </Button>
          <Link to="/login-signup" className="block">
            <Button variant="ghost" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
