import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api'
import type { CreateEditListing } from '@/types'

export interface CreateEditListingPayload {
  title: string
  description?: string
  status?: string
  category_id?: string
}

/** Fetch current user's create/edit listing records */
export function fetchCreateEditListings(): Promise<CreateEditListing[]> {
  return apiGet<CreateEditListing[]>('/create-edit-listing')
}

/** Fetch a single create/edit listing by id */
export function fetchCreateEditListing(id: string): Promise<CreateEditListing> {
  return apiGet<CreateEditListing>(`/create-edit-listing/${id}`)
}

/** Create a new listing (draft) */
export function createCreateEditListing(payload: CreateEditListingPayload): Promise<CreateEditListing> {
  return apiPost<CreateEditListing>('/create-edit-listing', { ...payload, status: payload.status ?? 'draft' })
}

/** Update a create/edit listing */
export function updateCreateEditListing(id: string, payload: Partial<CreateEditListingPayload>): Promise<CreateEditListing> {
  return apiPatch<CreateEditListing>(`/create-edit-listing/${id}`, payload)
}

/** Publish (set status to active) */
export function publishCreateEditListing(id: string): Promise<CreateEditListing> {
  return apiPut<CreateEditListing>(`/create-edit-listing/${id}/publish`)
}

/** Delete a create/edit listing */
export function deleteCreateEditListing(id: string): Promise<void> {
  return apiDelete(`/create-edit-listing/${id}`)
}
