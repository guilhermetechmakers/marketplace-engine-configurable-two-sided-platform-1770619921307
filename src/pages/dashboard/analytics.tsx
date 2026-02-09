import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 500 },
  { name: 'Apr', value: 450 },
  { name: 'May', value: 600 },
  { name: 'Jun', value: 550 },
]

export function DashboardAnalytics() {
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground">Views and performance over time</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing views</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="rgb(var(--primary))"
                    fill="rgb(var(--primary) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
