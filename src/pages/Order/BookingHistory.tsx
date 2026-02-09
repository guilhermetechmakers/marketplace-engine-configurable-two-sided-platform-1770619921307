import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SortingState } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  fetchOrderBookingHistory,
  fetchOrderBookingDetail,
  cancelOrderBooking,
  requestRefundOrderBooking,
  openDisputeOrderBooking,
} from '@/api/order-booking-history'
import type { ListOrderBookingHistoryResponse } from '@/api/order-booking-history'
import type { OrderFiltersState } from '@/components/order-booking-history/FiltersSearch'
import { FiltersSearch } from '@/components/order-booking-history/FiltersSearch'
import { OrdersList } from '@/components/order-booking-history/OrdersList'
import { OrderDetailSheet } from '@/components/order-booking-history/OrderDetailSheet'
import { ExportButtons } from '@/components/order-booking-history/ExportButtons'
import type { OrderBookingHistory } from '@/types'

const defaultFilters: OrderFiltersState = {
  status: 'all',
  transaction_mode: 'all',
  date_from: '',
  date_to: '',
  search: '',
}

function buildParams(f: OrderFiltersState) {
  return {
    status: f.status === 'all' ? undefined : f.status,
    transaction_mode:
      f.transaction_mode === 'all' ? undefined : (f.transaction_mode as 'checkout' | 'booking' | 'inquiry'),
    date_from: f.date_from || undefined,
    date_to: f.date_to || undefined,
    search: f.search || undefined,
  }
}

export default function BookingHistory() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<OrderFiltersState>(defaultFilters)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true },
  ])
  const [detailId, setDetailId] = useState<string | null>(null)

  const params = useMemo(() => buildParams(filters), [filters])

  const {
    data,
    isLoading: listLoading,
    isError: listError,
    error: listErr,
    refetch,
  } = useQuery({
    queryKey: ['order-booking-history', params],
    queryFn: () => fetchOrderBookingHistory(params),
    placeholderData: (prev: ListOrderBookingHistoryResponse | undefined) => prev,
  })

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['order-booking-detail', detailId],
    queryFn: () => fetchOrderBookingDetail(detailId!),
    enabled: !!detailId,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelOrderBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-booking-history'] })
      if (detailId)
        queryClient.invalidateQueries({ queryKey: ['order-booking-detail', detailId] })
      toast.success('Order cancelled')
      setDetailId(null)
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to cancel order')
    },
  })

  const refundMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      requestRefundOrderBooking(id, reason),
    onSuccess: (_: unknown, { id }: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ['order-booking-history'] })
      queryClient.invalidateQueries({ queryKey: ['order-booking-detail', id] })
      toast.success('Refund requested')
      setDetailId(null)
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to request refund')
    },
  })

  const disputeMutation = useMutation({
    mutationFn: ({ id, reason, description }: { id: string; reason: string; description?: string }) =>
      openDisputeOrderBooking(id, { reason, description }),
    onSuccess: (_: unknown, { id }: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ['order-booking-history'] })
      queryClient.invalidateQueries({ queryKey: ['order-booking-detail', id] })
      toast.success('Dispute opened')
      setDetailId(null)
      navigate('/dashboard/disputes')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to open dispute')
    },
  })

  const items = data?.items ?? []
  useEffect(() => {
    document.title = 'Order / Booking History | Marketplace'
    return () => {
      document.title = 'Marketplace'
    }
  }, [])

  const sortedItems = useMemo(() => {
    const [sort] = sorting
    if (!sort) return items
    return [...items].sort((a, b) => {
      const aVal = a[sort.id as keyof OrderBookingHistory]
      const bVal = b[sort.id as keyof OrderBookingHistory]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return sort.desc ? 1 : -1
      if (bVal == null) return sort.desc ? -1 : 1
      const cmp =
        typeof aVal === 'string' && typeof bVal === 'string'
          ? aVal.localeCompare(bVal)
          : typeof aVal === 'number' && typeof bVal === 'number'
            ? aVal - bVal
            : String(aVal).localeCompare(String(bVal))
      return sort.desc ? -cmp : cmp
    })
  }, [items, sorting])

  const handleOpenDispute = (orderId: string) => {
    disputeMutation.mutate({ id: orderId, reason: 'Other' })
  }

  const handleRequestRefund = (orderId: string) => {
    refundMutation.mutate({ id: orderId })
  }

  const handleContactSeller = () => {
    navigate('/dashboard/messages')
    toast.info('Open Messages to contact the seller.')
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Order / Booking History
          </h1>
          <p className="text-muted-foreground">
            View orders and bookings, request refunds, and open disputes
          </p>
        </div>
        <ExportButtons
          items={sortedItems}
          disabled={sortedItems.length === 0}
          className="shrink-0"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Orders &amp; bookings</CardTitle>
          <FiltersSearch
            filters={filters}
            onFiltersChange={(next) =>
              setFilters((prev) => ({ ...prev, ...next }))
            }
          />
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton
                  key={i}
                  className="h-12 w-full animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : listError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-muted-foreground mb-2">
                {(listErr as { message?: string })?.message ??
                  'Failed to load orders'}
              </p>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Retry
              </Button>
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground max-w-sm">
                No orders or bookings yet. When you complete a purchase or
                booking, it will appear here.
              </p>
              <Button
                variant="secondary"
                className="mt-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => setFilters(defaultFilters)}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <OrdersList
              orders={sortedItems}
              sorting={sorting}
              onSortingChange={setSorting}
              onViewDetail={(o) => setDetailId(o.id)}
              onCancel={(o) => cancelMutation.mutate(o.id)}
              onRequestRefund={(o) => handleRequestRefund(o.id)}
              onContactSeller={handleContactSeller}
              isLoading={listLoading}
            />
          )}
        </CardContent>
      </Card>

      <OrderDetailSheet
        orderId={detailId}
        detail={detail ?? null}
        isLoading={detailLoading && !!detailId}
        onClose={() => setDetailId(null)}
        onOpenDispute={handleOpenDispute}
        onRequestRefund={handleRequestRefund}
        onContactSeller={handleContactSeller}
      />
    </div>
  )
}
