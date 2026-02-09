import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrdersQuery, usePayoutsQuery, useRequestRefundMutation } from '@/hooks/use-orders'
import type { Order, OrderStatus, Payout } from '@/types'
import { FileText, Search, DollarSign, RotateCcw, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { toast } from 'sonner'

const statusVariant: Record<OrderStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pending: 'warning',
  confirmed: 'secondary',
  in_progress: 'default',
  completed: 'success',
  cancelled: 'destructive',
  refunded: 'outline',
  disputed: 'destructive',
}

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  disputed: 'Disputed',
}

const payoutStatusVariant: Record<Payout['status'], 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  pending: 'warning',
  processing: 'secondary',
  paid: 'success',
  failed: 'destructive',
}

function OrdersTable({ orders, role }: { orders: Order[]; role: 'buyer' | 'seller' }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])
  const [globalFilter, setGlobalFilter] = useState('')
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null)
  const refundMutation = useRequestRefundMutation()

  const columns = useMemo<ColumnDef<Order>[]>(() => {
    const base: ColumnDef<Order>[] = [
      {
        accessorKey: 'id',
        header: 'Order',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'listingId',
        header: 'Listing',
        cell: ({ row }) => (
          <Link
            to={`/listing/${row.original.listingId}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.listing?.title ?? `Listing ${row.original.listingId}`}
          </Link>
        ),
      },
      {
        accessorKey: 'totalCents',
        header: 'Total',
        cell: ({ getValue, row }) => {
          const cents = getValue() as number
          const currency = row.original.currency
          return `${(cents / 100).toFixed(2)} ${currency}`
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const s = getValue() as OrderStatus
          return <Badge variant={statusVariant[s]}>{statusLabel[s] ?? s}</Badge>
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
    ]
    const actions: ColumnDef<Order>[] = [
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const order = row.original
          const canRefund = role === 'seller' && (order.status === 'completed' || order.status === 'confirmed')
          return (
            <div className="flex items-center justify-end gap-2">
              <Link to={`/dashboard/orders/${order.id}`}>
                <Button variant="ghost" size="sm">View</Button>
              </Link>
              {canRefund && (
                <Dialog open={refundOrderId === order.id} onOpenChange={(open) => setRefundOrderId(open ? order.id : null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
                      <RotateCcw className="h-4 w-4" />
                      Refund
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request refund</DialogTitle>
                      <DialogDescription>
                        This will open a refund request for order {order.id}. The buyer will be notified.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          refundMutation.mutate(
                            { orderId: order.id },
                            {
                              onSuccess: () => {
                                toast.success('Refund requested')
                                setRefundOrderId(null)
                              },
                              onError: (e: Error & { message?: string }) => toast.error(e?.message ?? 'Refund request failed'),
                            }
                          )
                        }}
                        disabled={refundMutation.isPending}
                      >
                        {refundMutation.isPending ? 'Processing...' : 'Request refund'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )
        },
      },
    ]
    return [...base, ...actions]
  }, [role])

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="sticky top-0 bg-muted/95 backdrop-blur">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="transition-colors hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function DashboardOrders() {
  const { data: ordersData, isLoading: ordersLoading } = useOrdersQuery({ role: 'buyer' })
  const { data: sellerOrdersData } = useOrdersQuery({ role: 'seller' })
  const { data: payoutsData, isLoading: payoutsLoading } = usePayoutsQuery()

  const buyerOrders = ordersData?.orders ?? []
  const sellerOrders = sellerOrdersData?.orders ?? []
  const payouts = payoutsData?.payouts ?? []

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders & Payouts</h1>
        <p className="text-muted-foreground">Track orders and manage payouts</p>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="orders" className="gap-2">
            <FileText className="h-4 w-4" />
            My orders
          </TabsTrigger>
          <TabsTrigger value="payouts" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Sales & Payouts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order history</CardTitle>
              <p className="text-sm text-muted-foreground">Orders you placed as a buyer</p>
            </CardHeader>
            <CardContent>
              {ordersLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              )}
              {!ordersLoading && buyerOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-4 font-medium">No orders yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    When you purchase from the catalog, your orders will appear here.
                  </p>
                  <Link to="/catalog">
                    <Button className="mt-6">Browse catalog</Button>
                  </Link>
                </div>
              )}
              {!ordersLoading && buyerOrders.length > 0 && (
                <OrdersTable orders={buyerOrders} role="buyer" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payout summary
              </CardTitle>
              <p className="text-sm text-muted-foreground">Earnings from your sales</p>
            </CardHeader>
            <CardContent>
              {payoutsLoading && (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              )}
              {!payoutsLoading && payouts.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No payouts yet.</p>
              )}
              {!payoutsLoading && payouts.length > 0 && (
                <ul className="space-y-3">
                  {payouts.map((p: Payout) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-card"
                    >
                      <div>
                        <p className="font-mono text-sm text-muted-foreground">{p.id}</p>
                        <p className="font-semibold">${(p.amountCents / 100).toFixed(2)} {p.currency}</p>
                      </div>
                      <Badge variant={payoutStatusVariant[p.status as keyof typeof payoutStatusVariant]}>{p.status}</Badge>
                      {p.paidAt && (
                        <span className="text-xs text-muted-foreground w-full mt-1">
                          Paid {new Date(p.paidAt).toLocaleDateString()}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales (as seller)</CardTitle>
              <p className="text-sm text-muted-foreground">Orders placed for your listings</p>
            </CardHeader>
            <CardContent>
              {ordersLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              )}
              {!ordersLoading && sellerOrders.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No sales yet.</p>
              )}
              {!ordersLoading && sellerOrders.length > 0 && (
                <OrdersTable orders={sellerOrders} role="seller" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-center text-muted-foreground">Export order history</p>
          <Button variant="outline" className="mt-4 transition-transform hover:scale-[1.02]">
            Export
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
