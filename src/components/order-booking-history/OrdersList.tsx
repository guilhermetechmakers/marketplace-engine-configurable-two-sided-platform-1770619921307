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
import { Card, CardContent } from '@/components/ui/card'
import type { OrderBookingHistory, OrderTransactionMode } from '@/types'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

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
    <div className={cn('space-y-4', className)}>
      {/* Desktop: table with sticky header and row hover */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden bg-card transition-shadow shadow-card hover:shadow-card-hover">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="sticky top-0 z-10 bg-card border-b border-border font-medium"
                  >
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
                  className="cursor-pointer transition-all duration-200 hover:bg-muted/50 hover:shadow-sm"
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

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {!isLoading &&
          orders.map((order) => (
            <Card
              key={order.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:border-primary/30 border-border rounded-xl'
              )}
              onClick={() => onViewDetail(order)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {order.title || `Order #${order.id.slice(0, 8)}`}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formatDate(order.created_at)} · {formatMode(order.transaction_mode)}
                    </p>
                  </div>
                  <Badge variant={statusVariant(order.status)} className="shrink-0">
                    {order.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-sm font-medium">
                    {formatAmount(order.amount_cents, order.currency ?? 'USD')}
                  </span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {['active', 'pending'].includes(order.status) && onCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 h-8"
                        onClick={() => onCancel(order)}
                      >
                        Cancel
                      </Button>
                    )}
                    {order.status === 'completed' && onRequestRefund && (
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => onRequestRefund(order)}>
                        Refund
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => onViewDetail(order)}
                    >
                      View
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    {onContactSeller && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground h-8"
                        onClick={() => onContactSeller(order)}
                      >
                        Contact
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
