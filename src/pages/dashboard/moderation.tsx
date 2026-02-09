import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export function DashboardModeration() {
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Moderation queue</h1>
        <p className="text-muted-foreground">Review reported content and take action</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center max-w-sm">
            No items in the moderation queue. Reported listings and users will appear here.
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary">Filter by type</Button>
            <Button variant="outline">View history</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
