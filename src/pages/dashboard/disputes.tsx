import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  ChevronDown,
  Scale,
  FileText,
  Clock,
  ImagePlus,
  CheckCircle2,
  XCircle,
  DollarSign,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  fetchDisputes,
  fetchDispute,
  updateDisputeStatus,
  processRefund,
} from '@/api/disputes'
import type { Dispute, DisputeStatus } from '@/types'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under review' },
  { value: 'awaiting_evidence', label: 'Awaiting evidence' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'closed', label: 'Closed' },
]

function statusVariant(s: DisputeStatus): 'default' | 'secondary' | 'warning' | 'success' | 'destructive' | 'outline' {
  switch (s) {
    case 'open':
      return 'destructive'
    case 'under_review':
    case 'awaiting_evidence':
      return 'warning'
    case 'resolved':
    case 'closed':
      return 'secondary'
    case 'refunded':
      return 'success'
    default:
      return 'outline'
  }
}

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
  }).format(cents / 100)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    dateStyle: 'medium',
  })
}

export function DashboardDisputes() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])
  const [detailId, setDetailId] = useState<string | null>(null)
  const [resolutionOpen, setResolutionOpen] = useState(false)
  const [resolutionNote, setResolutionNote] = useState('')

  const statusParam = statusFilter === 'all' ? undefined : (statusFilter as DisputeStatus)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['disputes', statusParam, search],
    queryFn: () => fetchDisputes({ status: statusParam, search: search || undefined }),
    placeholderData: (prev) => prev,
  })

  const disputes = data?.disputes ?? []

  const { data: detailDispute, isLoading: detailLoading } = useQuery({
    queryKey: ['dispute', detailId],
    queryFn: () => fetchDispute(detailId!),
    enabled: !!detailId,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: DisputeStatus; note?: string }) =>
      updateDisputeStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] })
      if (detailId) queryClient.invalidateQueries({ queryKey: ['dispute', detailId] })
      toast.success('Status updated')
      setResolutionOpen(false)
      setResolutionNote('')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to update status')
    },
  })

  const refundMutation = useMutation({
    mutationFn: (disputeId: string) => processRefund(disputeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] })
      if (detailId) queryClient.invalidateQueries({ queryKey: ['dispute', detailId] })
      toast.success('Refund processed')
      setDetailId(null)
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to process refund')
    },
  })

  const columns = useMemo<ColumnDef<Dispute>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {(getValue() as string).slice(0, 8)}…
          </span>
        ),
      },
      {
        accessorKey: 'orderId',
        header: 'Order',
        cell: ({ getValue }) => (
          <span className="font-medium">#{(getValue() as string).slice(-6)}</span>
        ),
      },
      {
        accessorKey: 'amountCents',
        header: 'Amount',
        cell: ({ row }) =>
          formatAmount(row.original.amountCents, row.original.currency),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => (
          <Badge variant={statusVariant(getValue() as DisputeStatus)}>
            {(getValue() as string).replace(/_/g, ' ')}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-primary/10"
            onClick={() => setDetailId(row.original.id)}
          >
            View
          </Button>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: disputes,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const handleResolutionSubmit = (status: DisputeStatus) => {
    if (!detailId) return
    updateStatusMutation.mutate({ id: detailId, status, note: resolutionNote })
  }

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Disputes & Refunds</h1>
        <p className="text-muted-foreground">
          Handle user disputes, review evidence, and process refunds
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">All disputes</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID or order…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search disputes"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[140px] justify-between">
                  {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? 'Status'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-muted-foreground mb-2">
                {(error as { message?: string })?.message ?? 'Failed to load disputes'}
              </p>
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['disputes'] })}
              >
                Retry
              </Button>
            </div>
          ) : disputes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Scale className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground max-w-sm">
                No disputes match your filters. When users open disputes they will appear here for review.
              </p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setStatusFilter('all')
                  setSearch('')
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
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
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => setDetailId(row.original.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Detail sheet */}
      <Sheet open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Dispute details</SheetTitle>
          </SheetHeader>
          {detailLoading && !detailDispute ? (
            <div className="space-y-4 pt-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : detailDispute ? (
            <div className="space-y-6 pt-6">
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={statusVariant(detailDispute.status)}>
                    {detailDispute.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    {formatAmount(detailDispute.amountCents, detailDispute.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order</span>
                  <span className="font-mono text-xs">{detailDispute.orderId}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Reason: </span>
                  {detailDispute.reason}
                </div>
                {detailDispute.description && (
                  <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                    {detailDispute.description}
                  </p>
                )}
              </div>

              {detailDispute.evidence && detailDispute.evidence.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <ImagePlus className="h-4 w-4" />
                    Evidence
                  </h4>
                  <ul className="space-y-2">
                    {detailDispute.evidence.map((ev) => (
                      <li
                        key={ev.id}
                        className="rounded-md border border-border bg-card p-3 text-sm"
                      >
                        <span className="capitalize">{ev.type}</span>
                        {ev.note && <p className="text-muted-foreground mt-1">{ev.note}</p>}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(ev.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detailDispute.timeline && detailDispute.timeline.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    Timeline
                  </h4>
                  <ul className="space-y-3">
                    {[...detailDispute.timeline]
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .map((event) => (
                        <li
                          key={event.id}
                          className="flex gap-3 text-sm border-l-2 border-border pl-3 py-1"
                        >
                          <span className="text-muted-foreground shrink-0">
                            {formatDate(event.createdAt)}
                          </span>
                          <span className="capitalize">
                            {event.type.replace(/_/g, ' ')}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {detailDispute.resolution && (
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    Resolution
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {detailDispute.resolution}
                  </p>
                  {detailDispute.resolutionAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Resolved {formatDate(detailDispute.resolutionAt)}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {detailDispute.status !== 'refunded' &&
                  detailDispute.status !== 'closed' && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setResolutionOpen(true)}
                      >
                        Update status / Add resolution
                      </Button>
                      {['resolved', 'closed'].includes(detailDispute.status) === false && (
                        <Button
                          className="w-full gap-2 bg-secondary hover:bg-secondary/90"
                          onClick={() => refundMutation.mutate(detailDispute.id)}
                          disabled={refundMutation.isPending}
                        >
                          <DollarSign className="h-4 w-4" />
                          Process refund
                        </Button>
                      )}
                    </>
                  )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Resolution dialog */}
      <Dialog open={resolutionOpen} onOpenChange={setResolutionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update dispute status</DialogTitle>
            <DialogDescription>
              Change status and optionally add a resolution note visible to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="resolution-note" className="text-sm font-medium">
                Resolution note (optional)
              </label>
              <Input
                id="resolution-note"
                placeholder="e.g. Refund approved after review"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="resize-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResolutionSubmit('under_review')}
                disabled={updateStatusMutation.isPending}
              >
                Under review
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResolutionSubmit('awaiting_evidence')}
                disabled={updateStatusMutation.isPending}
              >
                Awaiting evidence
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700"
                onClick={() => handleResolutionSubmit('resolved')}
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Resolve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground"
                onClick={() => handleResolutionSubmit('closed')}
                disabled={updateStatusMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Close
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setResolutionOpen(false)
                setResolutionNote('')
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
