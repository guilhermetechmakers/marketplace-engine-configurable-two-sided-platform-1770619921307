import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { fetchListings, fetchListing, fetchBrowseListings, type ListingsResponse, type ListingDetailResponse, type BrowseListingsParams } from '@/api/listings'
import type { Listing } from '@/types'

const MOCK_LISTINGS: Listing[] = [
  { id: '1', title: 'Professional photography session', description: '2-hour outdoor or studio session.', price: 150, currency: 'USD', categoryId: 'cat-1', categoryName: 'Services', sellerId: 's1', images: [], attributes: { duration: '2 hours', location: 'Flexible' }, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', title: 'Cozy downtown apartment', description: 'Central location.', price: 95, currency: 'USD', categoryId: 'cat-2', categoryName: 'Rentals', sellerId: 's2', images: [], attributes: {}, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', title: 'Vintage camera bundle', description: 'Classic film cameras.', price: 320, currency: 'USD', categoryId: 'cat-3', categoryName: 'Goods', sellerId: 's1', images: [], attributes: {}, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', title: '1-on-1 guitar lessons', description: 'Beginner to advanced.', price: 60, currency: 'USD', categoryId: 'cat-1', categoryName: 'Services', sellerId: 's2', images: [], attributes: { duration: '1 hour' }, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', title: 'Mountain cabin weekend', description: 'Weekend getaway.', price: 280, currency: 'USD', categoryId: 'cat-2', categoryName: 'Rentals', sellerId: 's1', images: [], attributes: {}, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '6', title: 'Handmade leather bag', description: 'Artisan leather.', price: 180, currency: 'USD', categoryId: 'cat-3', categoryName: 'Goods', sellerId: 's2', images: [], attributes: {}, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

const queryKeys = {
  list: (params?: { q?: string; categoryId?: string }) => ['listings', params] as const,
  detail: (id: string) => ['listings', id] as const,
  browse: (params?: BrowseListingsParams) => ['listings', 'browse', params] as const,
}

function useListingsQuery(params?: { q?: string; categoryId?: string; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.list(params),
    queryFn: async (): Promise<ListingsResponse> => {
      try {
        return await fetchListings(params)
      } catch {
        return { listings: MOCK_LISTINGS, total: MOCK_LISTINGS.length }
      }
    },
  })
}

function useListingQuery(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.detail(id ?? ''),
    queryFn: async (): Promise<ListingDetailResponse> => {
      try {
        if (!id) throw new Error('No id')
        return await fetchListing(id)
      } catch {
        const listing = MOCK_LISTINGS.find((l) => l.id === id) ?? MOCK_LISTINGS[0]
        return {
          listing: { ...listing, id: id ?? listing.id },
          reviews: [
            { id: 'r1', rating: 5, body: 'Great experience!', author: { displayName: 'Jane' }, createdAt: new Date().toISOString() },
            { id: 'r2', rating: 4, body: 'Very professional.', author: { displayName: 'Mike' }, createdAt: new Date().toISOString() },
          ],
        }
      }
    },
    enabled: Boolean(id) && enabled,
  })
}

function useBrowseListingsQuery(params: BrowseListingsParams | undefined) {
  return useQuery({
    queryKey: queryKeys.browse(params),
    queryFn: async (): Promise<ListingsResponse> => {
      try {
        return await fetchBrowseListings(params)
      } catch {
        return mockBrowseListingsPage(params)
      }
    },
    enabled: true,
  })
}

function mockBrowseListingsPage(params: BrowseListingsParams | undefined): ListingsResponse {
  let list = [...MOCK_LISTINGS]
  if (params?.q) {
    const q = String(params.q).toLowerCase()
    list = list.filter((l) => l.title.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q))
  }
  if (params?.categoryId) list = list.filter((l) => l.categoryId === params.categoryId)
  if (params?.categoryIds?.length) list = list.filter((l) => params!.categoryIds!.includes(l.categoryId))
  if (params?.sort === 'price_asc') list.sort((a, b) => a.price - b.price)
  if (params?.sort === 'price_desc') list.sort((a, b) => b.price - a.price)
  if (params?.sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const limit = params?.limit ?? 24
  const cursor = params?.cursor ? parseInt(String(params.cursor), 10) : 0
  return {
    listings: list.slice(cursor, cursor + limit),
    total: list.length,
    nextCursor: cursor + limit < list.length ? String(cursor + limit) : null,
  }
}

function useBrowseListingsInfiniteQuery(baseParams: Omit<BrowseListingsParams, 'cursor'> | undefined) {
  return useInfiniteQuery({
    queryKey: queryKeys.browse(baseParams ?? {}),
    queryFn: async ({ pageParam }): Promise<ListingsResponse> => {
      const params = { ...baseParams, cursor: pageParam }
      try {
        return await fetchBrowseListings(params)
      } catch {
        return mockBrowseListingsPage(params)
      }
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: true,
  })
}

export { useListingsQuery, useListingQuery, useBrowseListingsQuery, useBrowseListingsInfiniteQuery, queryKeys as listingQueryKeys }
