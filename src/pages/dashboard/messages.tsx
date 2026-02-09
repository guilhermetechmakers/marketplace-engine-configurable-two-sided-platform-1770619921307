import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

export function DashboardMessages() {
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-muted-foreground">Conversations with buyers and sellers</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center max-w-sm">
            No messages yet. When someone contacts you about a listing, the thread will appear here.
          </p>
          <Button variant="secondary" className="mt-4">
            Browse listings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
