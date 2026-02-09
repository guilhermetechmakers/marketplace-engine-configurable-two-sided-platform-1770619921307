import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrderQuery } from '@/hooks/use-orders'
import type { OrderStatus } from '@/types'
import { ArrowLeft, ChevronRight } from 'lucide-react'

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  disputed: 'Disputed',
}

const statusVariant: Record<OrderStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pending: 'warning',
  confirmed: 'secondary',
  in_progress: 'default',
  completed: 'success',
  cancelled: 'destructive',
  refunded: 'outline',
  disputed: 'destructive',
}

export function DashboardOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading, isError, error } = useOrderQuery(id)
  const isRightOrder = order && id && order.id === id

  if (isError) {
    return (
      <div className="space-y-6 animate-in">
        <Link
          to="/dashboard/orders"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to orders
        </Link>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-12 text-center">
            <p className="font-medium text-destructive">Order not found</p>
            <p className="mt-1 text-sm text-muted-foreground">{error?.message ?? 'Invalid order ID.'}</p>
            <Link to="/dashboard/orders">
              <Button variant="outline" className="mt-4">Back to orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading || !id || !isRightOrder) {
    return (
      <div className="space-y-6 animate-in">
        <Skeleton className="h-6 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/dashboard/orders" className="hover:text-foreground">Orders</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-mono">{order.id}</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Order {order.id}</h1>
          <p className="text-muted-foreground">Placed {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <Badge variant={statusVariant[order.status as OrderStatus]} className="w-fit">
          {statusLabel[order.status as OrderStatus]}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Listing</p>
              <Link
                to={`/listing/${order.listingId}`}
                className="font-medium text-primary hover:underline"
              >
                {order.listing?.title ?? `Listing ${order.listingId}`}
              </Link>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="font-semibold">
                ${(order.totalCents / 100).toFixed(2)} {order.currency}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Link to="/dashboard/orders">
        <Button variant="secondary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to orders
        </Button>
      </Link>
    </div>
  )
}
