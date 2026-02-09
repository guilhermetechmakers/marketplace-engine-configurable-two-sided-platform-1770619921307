import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Scale, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const DISPUTE_REASONS = [
  { value: 'item_not_received', label: 'Item not received' },
  { value: 'item_not_as_described', label: 'Item not as described' },
  { value: 'quality_issue', label: 'Quality issue' },
  { value: 'service_issue', label: 'Service issue' },
  { value: 'billing_error', label: 'Billing error' },
  { value: 'Other', label: 'Other' },
] as const

export interface DisputeRefundCTAProps {
  /** Called when user submits the dispute form (opens dispute workflow). */
  onOpenDisputeSubmit?: (payload: { reason: string; description?: string }) => void
  /** Legacy: called immediately when opening dispute (no form). */
  onOpenDispute?: () => void
  onContactSeller?: () => void
  canRequestRefund?: boolean
  onRequestRefund?: () => void
  isLoading?: boolean
  className?: string
}

/** Opens dispute workflow (dialog with reason/description) or contact seller. */
export function DisputeRefundCTA({
  onOpenDisputeSubmit,
  onOpenDispute,
  onContactSeller,
  canRequestRefund = true,
  onRequestRefund,
  isLoading = false,
  className,
}: DisputeRefundCTAProps) {
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [reason, setReason] = useState<string>('')
  const [description, setDescription] = useState('')

  const handleOpenDisputeClick = () => {
    if (onOpenDisputeSubmit) {
      setReason('')
      setDescription('')
      setDisputeOpen(true)
    } else if (onOpenDispute) {
      onOpenDispute()
    }
  }

  const handleDisputeSubmit = () => {
    const selectedReason = reason || 'Other'
    onOpenDisputeSubmit?.({
      reason: selectedReason,
      description: description.trim() || undefined,
    })
    setDisputeOpen(false)
  }

  return (
    <>
      <div
        className={cn(
          'flex flex-col gap-2 sm:flex-row sm:flex-wrap',
          className
        )}
      >
        <Button
          variant="outline"
          className="gap-2 transition-transform hover:scale-[1.02] hover:shadow-card active:scale-[0.98] border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleOpenDisputeClick}
          disabled={isLoading || (!onOpenDisputeSubmit && !onOpenDispute)}
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

      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent className="sm:max-w-md rounded-xl border-border shadow-card">
          <DialogHeader>
            <DialogTitle>Open a dispute</DialogTitle>
            <DialogDescription>
              Provide a reason and optional details. This will start the dispute workflow and notify support.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="dispute-reason">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="dispute-reason" className="focus:ring-2 focus:ring-ring">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {DISPUTE_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dispute-description">Additional details (optional)</Label>
              <Textarea
                id="dispute-description"
                placeholder="Describe what happened..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] resize-none focus:ring-2 focus:ring-ring"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDisputeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDisputeSubmit}
              disabled={!reason}
              className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Submit dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
