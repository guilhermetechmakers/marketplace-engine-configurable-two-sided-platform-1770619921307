import { apiGet } from '@/lib/api'
import type { Listing } from '@/types'
import type { BrowseListingsSort } from '@/types'

export interface ListingsResponse {
  listings: Listing[]
  total?: number
  nextCursor?: string | null
}

export interface ListingDetailResponse {
  listing: Listing
  reviews?: { id: string; rating: number; body?: string; author?: { displayName?: string }; createdAt: string }[]
}

export interface BrowseListingsParams {
  q?: string
  location?: string
  radiusKm?: number
  categoryId?: string
  categoryIds?: string[]
  sort?: BrowseListingsSort
  limit?: number
  cursor?: string
  lat?: number
  lng?: number
  /** Dynamic filters as query params (e.g. priceMin, priceMax) */
  [key: string]: string | number | string[] | undefined
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

/** Build query for browse listings (full-text, facets, sort, pagination) */
export function fetchBrowseListings(params?: BrowseListingsParams): Promise<ListingsResponse> {
  const search = new URLSearchParams()
  if (params?.q) search.set('q', params.q)
  if (params?.location) search.set('location', params.location)
  if (params?.radiusKm != null) search.set('radiusKm', String(params.radiusKm))
  if (params?.categoryId) search.set('categoryId', params.categoryId)
  if (params?.categoryIds?.length) params.categoryIds.forEach((id) => search.append('categoryId', id))
  if (params?.sort) search.set('sort', params.sort)
  if (params?.limit != null) search.set('limit', String(params.limit))
  if (params?.cursor) search.set('cursor', params.cursor)
  if (params?.lat != null) search.set('lat', String(params.lat))
  if (params?.lng != null) search.set('lng', String(params.lng))
  Object.keys(params ?? {}).forEach((key) => {
    if (['q', 'location', 'radiusKm', 'categoryId', 'categoryIds', 'sort', 'limit', 'cursor', 'lat', 'lng'].includes(key)) return
    const v = (params as Record<string, unknown>)[key]
    if (v === undefined || v === '') return
    if (Array.isArray(v)) v.forEach((x) => search.append(key, String(x)))
    else search.set(key, String(v))
  })
  const query = search.toString()
  return apiGet<ListingsResponse>(`/listings${query ? `?${query}` : ''}`)
}

/** Fetch a single listing by id */
export function fetchListing(id: string): Promise<ListingDetailResponse> {
  return apiGet<ListingDetailResponse>(`/listings/${id}`)
}
