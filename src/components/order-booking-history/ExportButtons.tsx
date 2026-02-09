import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { OrderBookingHistory } from '@/types'
import { cn } from '@/lib/utils'

function escapeCsvCell(value: string): string {
  const s = String(value ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export interface ExportButtonsProps {
  items: OrderBookingHistory[]
  filename?: string
  disabled?: boolean
  className?: string
}

/** CSV export for user order/booking records. */
export function ExportButtons({
  items,
  filename = 'order-booking-history',
  disabled = false,
  className,
}: ExportButtonsProps) {
  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Title',
      'Description',
      'Status',
      'Transaction mode',
      'Amount',
      'Currency',
      'Created',
      'Updated',
    ]
    const rows = items.map((row) => [
      row.id,
      row.title,
      row.description ?? '',
      row.status,
      row.transaction_mode ?? '',
      row.amount_cents ?? '',
      row.currency ?? '',
      formatDate(row.created_at),
      formatDate(row.updated_at),
    ])
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((v) => escapeCsvCell(String(v))).join(',')),
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExportCsv}
      disabled={disabled}
      className={cn(
        'gap-2 transition-transform hover:scale-[1.02] hover:shadow-card active:scale-[0.98]',
        className
      )}
      aria-label="Export to CSV"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  )
}
