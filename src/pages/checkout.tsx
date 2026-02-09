import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useListingQuery } from '@/hooks/use-listings'
import { usePlaceOrderMutation } from '@/hooks/use-orders'
import { ArrowLeft, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

const checkoutSchema = z.object({
  cardNumber: z.string().min(13, 'Enter a valid card number').max(19),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Use MM/YY'),
  cvc: z.string().min(3, 'Enter 3 or 4 digits').max(4),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

const PLATFORM_FEE_PERCENT = 10

export function Checkout() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading: listingLoading } = useListingQuery(id)
  const placeOrder = usePlaceOrderMutation()

  const listing = data?.listing
  const subtotal = listing?.price ?? 0
  const fee = Math.round(subtotal * (PLATFORM_FEE_PERCENT / 100))
  const total = subtotal + fee

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      cardNumber: '',
      expiry: '',
      cvc: '',
      acceptTerms: true,
    },
  })

  useEffect(() => {
    if (placeOrder.isSuccess && placeOrder.data?.order) {
      toast.success('Order placed successfully')
      navigate('/dashboard/orders', { replace: true })
    }
  }, [placeOrder.isSuccess, placeOrder.data, navigate])

  useEffect(() => {
    if (placeOrder.isError) {
      toast.error(placeOrder.error?.message ?? 'Payment failed. Please try again.')
    }
  }, [placeOrder.isError, placeOrder.error])

  const onSubmit = (_data: CheckoutForm) => {
    if (!id) {
      toast.error('Invalid listing')
      return
    }
    placeOrder.mutate({ listingId: id })
  }

  if (listingLoading || !listing) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8 animate-in">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8 animate-in">
      <Link
        to={`/listing/${id}`}
        className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to listing
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">{listing.title}</p>
            <p className="text-xl font-semibold text-primary">
              ${subtotal.toFixed(2)} {listing.currency}
            </p>
            <Separator />
            <p className="text-sm text-muted-foreground">Platform fee ({PLATFORM_FEE_PERCENT}%): ${fee.toFixed(2)}</p>
            <p className="font-medium">Total: ${total.toFixed(2)} {listing.currency}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card number</Label>
              <Input
                id="cardNumber"
                placeholder="4242 4242 4242 4242"
                {...register('cardNumber')}
                className={cn(errors.cardNumber && 'border-destructive focus-visible:ring-destructive')}
                aria-invalid={Boolean(errors.cardNumber)}
              />
              {errors.cardNumber && (
                <p className="text-sm text-destructive" role="alert">{errors.cardNumber.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  {...register('expiry')}
                  className={cn(errors.expiry && 'border-destructive focus-visible:ring-destructive')}
                  aria-invalid={Boolean(errors.expiry)}
                />
                {errors.expiry && (
                  <p className="text-sm text-destructive" role="alert">{errors.expiry.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  type="password"
                  autoComplete="off"
                  {...register('cvc')}
                  className={cn(errors.cvc && 'border-destructive focus-visible:ring-destructive')}
                  aria-invalid={Boolean(errors.cvc)}
                />
                {errors.cvc && (
                  <p className="text-sm text-destructive" role="alert">{errors.cvc.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="acceptTerms"
            {...register('acceptTerms')}
            className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
            aria-invalid={Boolean(errors.acceptTerms)}
          />
          <Label htmlFor="acceptTerms" className="text-sm leading-relaxed cursor-pointer">
            I accept the terms of service and cancellation policy
          </Label>
        </div>
        {errors.acceptTerms && (
          <p className="text-sm text-destructive -mt-2" role="alert">{errors.acceptTerms.message}</p>
        )}

        <Button
          type="submit"
          className="w-full transition-transform hover:scale-[1.02]"
          size="lg"
          disabled={placeOrder.isPending}
        >
          {placeOrder.isPending ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </Button>
      </form>
    </div>
  )
}
