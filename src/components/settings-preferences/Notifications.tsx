import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/use-settings-preferences'
import { toast } from 'sonner'
import { Bell, Mail, Smartphone, MessageSquare } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { NotificationEventType, NotificationPreferences } from '@/types'
import { cn } from '@/lib/utils'

const EVENT_LABELS: Record<NotificationEventType, string> = {
  orders: 'Orders & bookings',
  messages: 'Messages',
  listings: 'Listings & reviews',
  reviews: 'Review requests',
  payouts: 'Payouts',
  promotions: 'Promotions & offers',
  security: 'Security alerts',
}

export function Notifications() {
  const { data: prefs, isLoading, isError } = useNotificationPreferences()
  const updateMutation = useUpdateNotificationPreferences()

  const handleToggle = (
    eventType: NotificationEventType,
    channel: 'email' | 'push' | 'inApp',
    checked: boolean
  ) => {
    if (!prefs) return
    const next = prefs.map((p: NotificationPreferences) =>
      p.eventType === eventType ? { ...p, [channel]: checked } : p
    )
    updateMutation.mutate(next, {
      onSuccess: () => toast.success('Notification preferences updated'),
      onError: () => toast.error('Failed to update preferences'),
    })
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-border shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (isError || !prefs?.length) {
    return (
      <Card className="rounded-2xl border border-border">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Unable to load notification preferences. Please try again later.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border border-border shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
        </CardTitle>
        <CardDescription>
          Choose how you receive updates (email, push, in-app) per event type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {prefs.map((p: NotificationPreferences) => (
          <div
            key={p.eventType}
            className={cn(
              'rounded-xl border border-border bg-card p-4 transition-all duration-200',
              'hover:border-primary/30 hover:shadow-card'
            )}
          >
            <p className="mb-3 font-medium text-foreground">
              {EVENT_LABELS[p.eventType]}
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor={`${p.eventType}-email`} className="cursor-pointer text-sm">
                  Email
                </Label>
                <Switch
                  id={`${p.eventType}-email`}
                  checked={p.email}
                  onCheckedChange={(checked) =>
                    handleToggle(p.eventType, 'email', checked)
                  }
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor={`${p.eventType}-push`} className="cursor-pointer text-sm">
                  Push
                </Label>
                <Switch
                  id={`${p.eventType}-push`}
                  checked={p.push}
                  onCheckedChange={(checked) =>
                    handleToggle(p.eventType, 'push', checked)
                  }
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor={`${p.eventType}-inApp`} className="cursor-pointer text-sm">
                  In-app
                </Label>
                <Switch
                  id={`${p.eventType}-inApp`}
                  checked={p.inApp}
                  onCheckedChange={(checked) =>
                    handleToggle(p.eventType, 'inApp', checked)
                  }
                  disabled={updateMutation.isPending}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
