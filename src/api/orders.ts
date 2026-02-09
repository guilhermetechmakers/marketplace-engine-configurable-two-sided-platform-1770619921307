import { apiGet, apiPost, apiPatch } from '@/lib/api'
import type { Order, Payout } from '@/types'

export interface OrdersResponse {
  orders: Order[]
  total?: number
}

export interface PayoutsResponse {
  payouts: Payout[]
  total?: number
}

export interface PlaceOrderRequest {
  listingId: string
  quantity?: number
}

export interface PlaceOrderResponse {
  order: Order
  redirectUrl?: string
}

/** Fetch orders for current user (buyer or seller depending on backend) */
export function fetchOrders(params?: { role?: 'buyer' | 'seller'; status?: string }): Promise<OrdersResponse> {
  const search = new URLSearchParams()
  if (params?.role) search.set('role', params.role)
  if (params?.status) search.set('status', params.status)
  const query = search.toString()
  return apiGet<OrdersResponse>(`/orders${query ? `?${query}` : ''}`)
}

/** Fetch a single order by id */
export function fetchOrder(id: string): Promise<{ order: Order }> {
  return apiGet<{ order: Order }>(`/orders/${id}`)
}

/** Create order (checkout) */
export function placeOrder(body: PlaceOrderRequest): Promise<PlaceOrderResponse> {
  return apiPost<PlaceOrderResponse>('/orders', body)
}

/** Seller: request refund for an order */
export function requestRefund(orderId: string, body?: { reason?: string }): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`/orders/${orderId}/refund`, body ?? {})
}

/** Fetch payouts for seller */
export function fetchPayouts(): Promise<PayoutsResponse> {
  return apiGet<PayoutsResponse>('/payouts')
}

/** Update order status (e.g. confirm, cancel) */
export function updateOrderStatus(orderId: string, status: string): Promise<{ order: Order }> {
  return apiPatch<{ order: Order }>(`/orders/${orderId}`, { status })
}
