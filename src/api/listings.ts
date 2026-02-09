import { apiGet } from '@/lib/api'
import type { Listing } from '@/types'

export interface ListingsResponse {
  listings: Listing[]
  total?: number
}

export interface ListingDetailResponse {
  listing: Listing
  reviews?: { id: string; rating: number; body?: string; author?: { displayName?: string }; createdAt: string }[]
}

/** Fetch catalog listings with optional search and filters */
export function fetchListings(params?: { q?: string; categoryId?: string; limit?: number }): Promise<ListingsResponse> {
  const search = new URLSearchParams()
  if (params?.q) search.set('q', params.q)
  if (params?.categoryId) search.set('categoryId', params.categoryId)
  if (params?.limit) search.set('limit', String(params.limit))
  const query = search.toString()
  return apiGet<ListingsResponse>(`/listings${query ? `?${query}` : ''}`)
}

/** Fetch a single listing by id */
export function fetchListing(id: string): Promise<ListingDetailResponse> {
  return apiGet<ListingDetailResponse>(`/listings/${id}`)
}
