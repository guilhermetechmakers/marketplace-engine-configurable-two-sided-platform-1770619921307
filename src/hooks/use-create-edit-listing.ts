import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCreateEditListings,
  fetchCreateEditListing,
  createCreateEditListing,
  updateCreateEditListing,
  publishCreateEditListing,
  deleteCreateEditListing,
  type CreateEditListingPayload,
} from '@/api/create-edit-listing'
import type { CreateEditListing } from '@/types'

export const createEditListingQueryKeys = {
  list: () => ['create-edit-listing'] as const,
  detail: (id: string) => ['create-edit-listing', id] as const,
}

export function useCreateEditListingsQuery() {
  return useQuery({
    queryKey: createEditListingQueryKeys.list(),
    queryFn: fetchCreateEditListings,
  })
}

export function useCreateEditListingQuery(id: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: createEditListingQueryKeys.detail(id ?? ''),
    queryFn: () => fetchCreateEditListing(id!),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateCreateEditListingMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEditListingPayload) => createCreateEditListing(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: createEditListingQueryKeys.list() }),
  })
}

export function useUpdateCreateEditListingMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateEditListingPayload> }) =>
      updateCreateEditListing(id, payload),
    onSuccess: (data: CreateEditListing) => {
      qc.invalidateQueries({ queryKey: createEditListingQueryKeys.list() })
      qc.invalidateQueries({ queryKey: createEditListingQueryKeys.detail(data.id) })
    },
  })
}

export function usePublishCreateEditListingMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => publishCreateEditListing(id),
    onSuccess: (data: CreateEditListing) => {
      qc.invalidateQueries({ queryKey: createEditListingQueryKeys.list() })
      qc.invalidateQueries({ queryKey: createEditListingQueryKeys.detail(data.id) })
    },
  })
}

export function useDeleteCreateEditListingMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteCreateEditListing,
    onSuccess: () => qc.invalidateQueries({ queryKey: createEditListingQueryKeys.list() }),
  })
}
