import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { OrderBookingHistory, OrderTransactionMode } from '@/types'
import { cn } from '@/lib/utils'

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    dateStyle: 'medium',
  })
}

function formatAmount(cents?: number, currency?: string): string {
  if (cents == null) return '—'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
  }).format(cents / 100)
}

function formatMode(mode?: OrderTransactionMode): string {
  if (!mode) return '—'
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

export interface OrdersListProps {
  orders: OrderBookingHistory[]
  sorting: SortingState
  onSortingChange: (s: SortingState) => void
  onViewDetail: (order: OrderBookingHistory) => void
  onCancel?: (order: OrderBookingHistory) => void
  onRequestRefund?: (order: OrderBookingHistory) => void
  onContactSeller?: (order: OrderBookingHistory) => void
  isLoading?: boolean
  className?: string
}

/** Concise rows with status badges and primary actions. */
export function OrdersList({
  orders,
  sorting,
  onSortingChange,
  onViewDetail,
  onCancel,
  onRequestRefund,
  onContactSeller,
  isLoading = false,
  className,
}: OrdersListProps) {
  const columns: ColumnDef<OrderBookingHistory>[] = [
    {
      accessorKey: 'title',
      header: 'Order / Title',
      cell: ({ getValue, row }) => (
        <div className="font-medium text-foreground">
          {(getValue() as string) || `Order #${row.original.id.slice(0, 8)}`}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge variant={statusVariant(getValue() as string)}>
          {(getValue() as string).replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'transaction_mode',
      header: 'Type',
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm">
          {formatMode(getValue() as OrderTransactionMode)}
        </span>
      ),
    },
    {
      accessorKey: 'amount_cents',
      header: 'Amount',
      cell: ({ row }) =>
        formatAmount(row.original.amount_cents, row.original.currency),
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(getValue() as string)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const o = row.original
        const canCancel = ['active', 'pending'].includes(o.status)
        const canRefund = ['completed'].includes(o.status)
        return (
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-primary/10"
              onClick={() => onViewDetail(o)}
            >
              View
            </Button>
            {canCancel && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => onCancel(o)}
              >
                Cancel
              </Button>
            )}
            {canRefund && onRequestRefund && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRequestRefund(o)}
              >
                Refund
              </Button>
            )}
            {onContactSeller && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => onContactSeller(o)}
              >
                Contact
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : sorting
      onSortingChange(next)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div
      className={cn(
        'rounded-lg border border-border overflow-hidden transition-shadow hover:shadow-card',
        className
      )}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="sticky top-0 bg-card z-10">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {!isLoading &&
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer transition-colors hover:bg-muted/50 hover:shadow-sm"
                onClick={() => onViewDetail(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
