import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Clock,
  MessageSquare,
  Receipt,
} from 'lucide-react'
import type { OrderBookingHistory, OrderTimelineEvent, OrderReceipt, OrderMessage } from '@/types'
import { DisputeRefundCTA } from './DisputeRefundCTA'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
  }).format(cents / 100)
}

const statusVariant = (
  s: string
): 'default' | 'secondary' | 'warning' | 'success' | 'destructive' | 'outline' => {
  switch (s) {
    case 'completed':
    case 'refunded':
      return 'success'
    case 'pending':
    case 'active':
      return 'warning'
    case 'cancelled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export interface OrderDetailSheetProps {
  orderId: string | null
  detail: (OrderBookingHistory & {
    timeline?: OrderTimelineEvent[]
    receipts?: OrderReceipt[]
    messages?: OrderMessage[]
  }) | null
  isLoading: boolean
  onClose: () => void
  onOpenDispute: (orderId: string) => void
  onRequestRefund?: (orderId: string) => void
  onContactSeller?: (orderId: string) => void
}

/** Order detail: timeline of events, receipts, messages, dispute button. */
export function OrderDetailSheet({
  orderId,
  detail,
  isLoading,
  onClose,
  onOpenDispute,
  onRequestRefund,
  onContactSeller,
}: OrderDetailSheetProps) {
  const open = !!orderId

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-hidden flex flex-col p-0"
      >
        <SheetHeader className="border-b border-border px-6 py-4 shrink-0">
          <SheetTitle className="text-left">Order details</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 px-6 py-4">
          {isLoading && !detail ? (
            <div className="space-y-4 animate-in">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : detail ? (
            <div className="space-y-6 animate-in">
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm font-medium">{detail.title}</span>
                  <Badge variant={statusVariant(detail.status)}>
                    {detail.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                {detail.description && (
                  <p className="text-sm text-muted-foreground">
                    {detail.description}
                  </p>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    {detail.amount_cents != null
                      ? formatAmount(detail.amount_cents, detail.currency ?? 'USD')
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(detail.created_at)}</span>
                </div>
              </div>

              {detail.timeline && detail.timeline.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    Timeline
                  </h4>
                  <ul className="space-y-3">
                    {[...detail.timeline]
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime()
                      )
                      .map((event) => (
                        <li
                          key={event.id}
                          className="flex gap-3 text-sm border-l-2 border-primary/30 pl-3 py-1"
                        >
                          <span className="text-muted-foreground shrink-0">
                            {formatDate(event.created_at)}
                          </span>
                          <span>{event.label || event.type}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {detail.receipts && detail.receipts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Receipt className="h-4 w-4" />
                    Receipts
                  </h4>
                  <ul className="space-y-2">
                    {detail.receipts.map((r) => (
                      <li
                        key={r.id}
                        className="flex justify-between items-center rounded-md border border-border bg-card p-3 text-sm"
                      >
                        <span>{r.label}</span>
                        <span className="font-medium">
                          {formatAmount(r.amount_cents, r.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detail.messages && detail.messages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </h4>
                  <ul className="space-y-2">
                    {detail.messages.map((m) => (
                      <li
                        key={m.id}
                        className="rounded-md border border-border bg-card p-3 text-sm"
                      >
                        <p className="text-muted-foreground text-xs mb-1">
                          {formatDate(m.created_at)}
                        </p>
                        <p>{m.body}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <DisputeRefundCTA
                  onOpenDispute={() => detail.id && onOpenDispute(detail.id)}
                  onContactSeller={
                    onContactSeller
                      ? () => detail.id && onContactSeller(detail.id)
                      : undefined
                  }
                  canRequestRefund={detail.status === 'completed'}
                  onRequestRefund={
                    onRequestRefund && detail.status === 'completed'
                      ? () => onRequestRefund(detail.id)
                      : undefined
                  }
                />
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
