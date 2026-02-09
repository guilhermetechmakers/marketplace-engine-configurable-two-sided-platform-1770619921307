import { Button } from '@/components/ui/button'
import { Scale, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DisputeRefundCTAProps {
  onOpenDispute: () => void
  onContactSeller?: () => void
  canRequestRefund?: boolean
  onRequestRefund?: () => void
  isLoading?: boolean
  className?: string
}

/** Opens dispute workflow or contact seller. */
export function DisputeRefundCTA({
  onOpenDispute,
  onContactSeller,
  canRequestRefund = true,
  onRequestRefund,
  isLoading = false,
  className,
}: DisputeRefundCTAProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:flex-wrap',
        className
      )}
    >
      <Button
        variant="outline"
        className="gap-2 transition-transform hover:scale-[1.02] hover:shadow-card active:scale-[0.98] border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onOpenDispute}
        disabled={isLoading}
        aria-label="Open dispute"
      >
        <Scale className="h-4 w-4" />
        Open dispute
      </Button>
      {canRequestRefund && onRequestRefund && (
        <Button
          variant="outline"
          className="gap-2 transition-transform hover:scale-[1.02] hover:shadow-card active:scale-[0.98]"
          onClick={onRequestRefund}
          disabled={isLoading}
          aria-label="Request refund"
        >
          Request refund
        </Button>
      )}
      {onContactSeller && (
        <Button
          variant="secondary"
          size="sm"
          className="gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={onContactSeller}
          disabled={isLoading}
          aria-label="Contact seller"
        >
          <MessageCircle className="h-4 w-4" />
          Contact seller
        </Button>
      )}
    </div>
  )
}
