import { apiGet, apiPost, apiPut } from '@/lib/api'
import type {
  OrderBookingHistory,
  OrderTransactionMode,
  OrderTimelineEvent,
  OrderReceipt,
  OrderMessage,
} from '@/types'

export interface ListOrderBookingHistoryParams {
  status?: string
  transaction_mode?: OrderTransactionMode
  date_from?: string
  date_to?: string
  search?: string
}

export interface ListOrderBookingHistoryResponse {
  items: OrderBookingHistory[]
  total: number
}

export function fetchOrderBookingHistory(
  params?: ListOrderBookingHistoryParams
): Promise<ListOrderBookingHistoryResponse> {
  const search = new URLSearchParams()
  if (params?.status) search.set('status', params.status)
  if (params?.transaction_mode) search.set('transaction_mode', params.transaction_mode)
  if (params?.date_from) search.set('date_from', params.date_from)
  if (params?.date_to) search.set('date_to', params.date_to)
  if (params?.search) search.set('q', params.search)
  const query = search.toString()
  return apiGet<ListOrderBookingHistoryResponse>(
    `/order-booking-history${query ? `?${query}` : ''}`
  )
}

export interface OrderDetailResponse extends OrderBookingHistory {
  timeline?: OrderTimelineEvent[]
  receipts?: OrderReceipt[]
  messages?: OrderMessage[]
}

export function fetchOrderBookingDetail(id: string): Promise<OrderDetailResponse> {
  return apiGet<OrderDetailResponse>(`/order-booking-history/${id}`)
}

export function cancelOrderBooking(id: string): Promise<OrderBookingHistory> {
  return apiPut<OrderBookingHistory>(`/order-booking-history/${id}/cancel`, {})
}

export function requestRefundOrderBooking(id: string, reason?: string): Promise<{ disputeId: string }> {
  return apiPost<{ disputeId: string }>(`/order-booking-history/${id}/refund-request`, { reason })
}

export function openDisputeOrderBooking(id: string, payload: { reason: string; description?: string }): Promise<{ disputeId: string }> {
  return apiPost<{ disputeId: string }>(`/order-booking-history/${id}/dispute`, payload)
}
