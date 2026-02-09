import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, FileText, MessageSquare, DollarSign, ArrowRight } from 'lucide-react'

const metrics = [
  { label: 'Active listings', value: '12', change: '+2', icon: FileText, href: '/dashboard/projects' },
  { label: 'Messages', value: '5', change: 'New', icon: MessageSquare, href: '/dashboard/messages' },
  { label: 'Orders', value: '8', change: '+1', icon: TrendingUp, href: '/dashboard/orders' },
  { label: 'Earnings', value: '$1,240', change: '+12%', icon: DollarSign, href: '/dashboard' },
]

export function DashboardOverview() {
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-muted-foreground">Your marketplace activity at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, change, icon: Icon, href }) => (
          <Card key={label} className="transition-shadow hover:shadow-card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{value}</p>
              <p className="text-xs text-muted-foreground">{change} from last period</p>
              {href && (
                <Link to={href} className="mt-2 inline-flex items-center text-sm text-primary hover:underline">
                  View <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity yet.</p>
            <Link to="/catalog">
              <Button variant="secondary" size="sm" className="mt-2">
                Browse catalog
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link to="/listing/new">
              <Button size="sm">New listing</Button>
            </Link>
            <Link to="/dashboard/messages">
              <Button size="sm" variant="secondary">Messages</Button>
            </Link>
            <Link to="/dashboard/settings">
              <Button size="sm" variant="outline">Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
