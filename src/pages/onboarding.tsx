import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Store, CreditCard, FileCheck, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, title: 'Business details', icon: Store },
  { id: 2, title: 'Payout setup', icon: CreditCard },
  { id: 3, title: 'Verification', icon: FileCheck },
]

export function Onboarding() {
  const [step, setStep] = useState(1)
  const navigate = useNavigate()

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
    else {
      toast.success('Onboarding complete')
      navigate('/dashboard')
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12 animate-in">
      <div className="flex justify-between mb-8">
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium',
                step >= s.id ? 'border-primary bg-primary text-primary-foreground' : 'border-muted text-muted-foreground'
              )}
            >
              {step > s.id ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
            </div>
            <span className="mt-2 text-xs font-medium text-muted-foreground">{s.title}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step - 1].title}</CardTitle>
          <CardDescription>
            {step === 1 && 'Tell us about your business.'}
            {step === 2 && 'Connect Stripe for payouts.'}
            {step === 3 && 'Upload ID for verification.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Business name</Label>
                <Input placeholder="Your business or name" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="What you offer" />
              </div>
            </>
          )}
          {step === 2 && (
            <p className="text-muted-foreground">
              You will be redirected to Stripe Connect to link your account.
            </p>
          )}
          {step === 3 && (
            <p className="text-muted-foreground">
              Upload a government-issued ID for verification.
            </p>
          )}
          <Button onClick={handleNext} className="w-full">
            {step < 3 ? 'Continue' : 'Finish'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
