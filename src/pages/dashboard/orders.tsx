import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const MOCK_ORDERS = [
  { id: 'O-001', listingTitle: 'Professional photography session', total: 150, status: 'completed', date: '2024-01-15' },
  { id: 'O-002', listingTitle: 'Guitar lessons', total: 60, status: 'pending', date: '2024-01-20' },
]

const statusVariant = (s: string) =>
  s === 'completed' ? 'success' : s === 'pending' ? 'warning' : 'secondary'

export function DashboardOrders() {
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      <div className="space-y-4">
        {MOCK_ORDERS.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">{order.listingTitle}</CardTitle>
              <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
            </CardHeader>
            <CardContent className="flex flex-row items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {order.id} · ${order.total} · {order.date}
              </div>
              <Link to={`/orders/${order.id}`}>
                <Button variant="secondary" size="sm">View</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">Export order history</p>
          <Button variant="outline" className="mt-4">Export</Button>
        </CardContent>
      </Card>
    </div>
  )
}
