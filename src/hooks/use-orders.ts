import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchOrders,
  fetchOrder,
  fetchPayouts,
  placeOrder,
  requestRefund,
  type PlaceOrderRequest,
  type OrdersResponse,
  type PayoutsResponse,
} from '@/api/orders'
import type { Order, Payout } from '@/types'

const MOCK_ORDERS: Order[] = [
  { id: 'O-001', listingId: '1', buyerId: 'b1', sellerId: 's1', status: 'completed', totalCents: 15000, currency: 'USD', createdAt: '2024-01-15', updatedAt: '2024-01-16' },
  { id: 'O-002', listingId: '4', buyerId: 'b1', sellerId: 's2', status: 'confirmed', totalCents: 6000, currency: 'USD', createdAt: '2024-01-20', updatedAt: '2024-01-20' },
]

const MOCK_PAYOUTS: Payout[] = [
  { id: 'P-001', sellerId: 's1', amountCents: 43000, currency: 'USD', status: 'paid', orderIds: ['O-001'], paidAt: '2024-01-25', createdAt: '2024-01-20' },
]

const queryKeys = {
  list: (params?: { role?: string; status?: string }) => ['orders', params] as const,
  detail: (id: string) => ['orders', id] as const,
  payouts: () => ['payouts'] as const,
}

export function useOrdersQuery(params?: { role?: 'buyer' | 'seller'; status?: string }) {
  return useQuery({
    queryKey: queryKeys.list(params),
    queryFn: async (): Promise<OrdersResponse> => {
      try {
        return await fetchOrders(params)
      } catch {
        return { orders: MOCK_ORDERS, total: MOCK_ORDERS.length }
      }
    },
  })
}

export function useOrderQuery(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.detail(id ?? ''),
    queryFn: async () => {
      try {
        if (!id) throw new Error('No id')
        const res = await fetchOrder(id)
        return res.order
      } catch {
        return MOCK_ORDERS.find((o) => o.id === id) ?? MOCK_ORDERS[0]
      }
    },
    enabled: Boolean(id) && enabled,
  })
}

export function usePayoutsQuery() {
  return useQuery({
    queryKey: queryKeys.payouts(),
    queryFn: async (): Promise<PayoutsResponse> => {
      try {
        return await fetchPayouts()
      } catch {
        return { payouts: MOCK_PAYOUTS, total: MOCK_PAYOUTS.length }
      }
    },
  })
}

export function usePlaceOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: PlaceOrderRequest) => placeOrder(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useRequestRefundMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) => requestRefund(orderId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['payouts'] })
    },
  })
}

export { queryKeys as orderQueryKeys }
