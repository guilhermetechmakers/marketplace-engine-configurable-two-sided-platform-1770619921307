import { apiGet, apiPatch, apiPost } from '@/lib/api'
import type { Dispute, DisputeEvidence, DisputeStatus, Refund } from '@/types'

export interface ListDisputesParams {
  status?: DisputeStatus
  search?: string
}

export interface ListDisputesResponse {
  disputes: Dispute[]
  total: number
}

export function fetchDisputes(params?: ListDisputesParams): Promise<ListDisputesResponse> {
  const search = new URLSearchParams()
  if (params?.status) search.set('status', params.status)
  if (params?.search) search.set('q', params.search)
  const query = search.toString()
  return apiGet<ListDisputesResponse>(`/disputes${query ? `?${query}` : ''}`)
}

export function fetchDispute(id: string): Promise<Dispute> {
  return apiGet<Dispute>(`/disputes/${id}`)
}

export function updateDisputeStatus(
  id: string,
  status: DisputeStatus,
  note?: string
): Promise<Dispute> {
  return apiPatch<Dispute>(`/disputes/${id}`, { status, resolution: note })
}

export function addDisputeEvidence(
  disputeId: string,
  payload: { type: DisputeEvidence['type']; note?: string; url?: string }
): Promise<DisputeEvidence> {
  return apiPost<DisputeEvidence>(`/disputes/${disputeId}/evidence`, payload)
}

export function processRefund(disputeId: string): Promise<Refund> {
  return apiPost<Refund>(`/disputes/${disputeId}/refund`, {})
}
