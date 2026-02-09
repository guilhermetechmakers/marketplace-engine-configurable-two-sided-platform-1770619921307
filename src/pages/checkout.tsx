import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export function Checkout() {
  const { id } = useParams<{ id: string }>()
  const [accepted, setAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accepted) {
      toast.error('Please accept the terms')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      toast.success('Order placed successfully')
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in py-8">
      <Link to={`/listing/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to listing
      </Link>

      <h1 className="text-2xl font-semibold">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">Professional photography session</p>
            <p className="text-xl font-semibold">$150.00 USD</p>
            <Separator />
            <p className="text-sm text-muted-foreground">Platform fee: $15.00</p>
            <p className="font-medium">Total: $165.00 USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Card number</Label>
              <Input placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry</Label>
                <Input placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label>CVC</Label>
                <Input placeholder="123" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="terms"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="rounded border-input"
          />
          <Label htmlFor="terms">I accept the terms of service and cancellation policy</Label>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Pay $165.00'}
        </Button>
      </form>
    </div>
  )
}
