import { useState, useMemo, useCallback, useEffect } from 'react'
import { SearchBar } from '@/components/catalog-browse-listings/SearchBar'
import { CategoryFacets } from '@/components/catalog-browse-listings/CategoryFacets'
import { DynamicFilters, getSchemaFromCategories } from '@/components/catalog-browse-listings/DynamicFilters'
import { SortControls } from '@/components/catalog-browse-listings/SortControls'
import { ViewToggle } from '@/components/catalog-browse-listings/ViewToggle'
import { ListingsGrid } from '@/components/catalog-browse-listings/ListingsGrid'
import { PaginationInfiniteScroll } from '@/components/catalog-browse-listings/PaginationInfiniteScroll'
import { MapView } from '@/components/catalog-browse-listings/MapView'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBrowseListingsInfiniteQuery } from '@/hooks/use-listings'
import { CATEGORY_TREE } from '@/config/catalog-browse-listings'
import type { BrowseListingsFilters } from '@/types'

const DEFAULT_FILTERS: BrowseListingsFilters = {
  keyword: '',
  location: '',
  radiusKm: 25,
  categoryIds: [],
  sort: 'relevance',
  view: 'grid',
  attributes: {},
}

const PAGE_SIZE = 24

export default function BrowseListings() {
  const [filters, setFilters] = useState<BrowseListingsFilters>(DEFAULT_FILTERS)

  const apiParams = useMemo(() => {
    const p: Record<string, string | number | string[] | undefined> = {
      q: filters.keyword || undefined,
      location: filters.location || undefined,
      radiusKm: filters.radiusKm,
      sort: filters.sort,
      limit: PAGE_SIZE,
    }
    if (filters.categoryIds.length) {
      p.categoryIds = filters.categoryIds
      p.categoryId = filters.categoryIds[0]
    }
    Object.entries(filters.attributes).forEach(([k, v]) => {
      if (v === '' || v === undefined) return
      if (Array.isArray(v)) (p as Record<string, unknown>)[k] = v
      else (p as Record<string, unknown>)[k] = v
    })
    return p
  }, [filters])

  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBrowseListingsInfiniteQuery(apiParams)
  const listings = useMemo(
    () => data?.pages.flatMap((p) => p.listings) ?? [],
    [data?.pages]
  )
  const total = data?.pages[0]?.total ?? 0
  const hasMore = Boolean(hasNextPage)

  const schema = useMemo(() => getSchemaFromCategories(CATEGORY_TREE), [])

  const handleKeywordChange = useCallback((value: string) => {
    setFilters((f) => ({ ...f, keyword: value }))
  }, [])
  const handleLocationChange = useCallback((value: string) => {
    setFilters((f) => ({ ...f, location: value }))
  }, [])
  const handleRadiusChange = useCallback((value: number) => {
    setFilters((f) => ({ ...f, radiusKm: value }))
  }, [])
  const handleCategoryToggle = useCallback((id: string) => {
    setFilters((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    }))
  }, [])
  const handleSortChange = useCallback((value: BrowseListingsFilters['sort']) => {
    setFilters((f) => ({ ...f, sort: value }))
  }, [])
  const handleViewChange = useCallback((value: BrowseListingsFilters['view']) => {
    setFilters((f) => ({ ...f, view: value }))
  }, [])
  const handleAttributeChange = useCallback((key: string, value: string | number | number[] | string[]) => {
    setFilters((f) => ({
      ...f,
      attributes: { ...f.attributes, [key]: value },
    }))
  }, [])
  const handleLoadMore = useCallback(() => {
    fetchNextPage()
  }, [fetchNextPage])

  useEffect(() => {
    document.title = 'Browse Listings | Marketplace'
    return () => {
      document.title = 'Marketplace'
    }
  }, [])

  return (
    <div className="container mx-auto max-w-[1200px] px-4 py-8 md:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Browse listings</h1>
          <p className="mt-1 text-muted-foreground">Search, filter, and discover services, rentals, and goods</p>
        </header>

        <SearchBar
          keyword={filters.keyword}
          location={filters.location}
          radiusKm={filters.radiusKm}
          onKeywordChange={handleKeywordChange}
          onLocationChange={handleLocationChange}
          onRadiusChange={handleRadiusChange}
        />

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <aside className="lg:w-64 shrink-0 space-y-4">
            <CategoryFacets
              categories={CATEGORY_TREE}
              selectedIds={filters.categoryIds}
              onToggle={handleCategoryToggle}
            />
            <DynamicFilters
              schema={schema}
              values={filters.attributes}
              onChange={handleAttributeChange}
            />
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {total} result{total !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <SortControls value={filters.sort} onChange={handleSortChange} />
                <ViewToggle value={filters.view} onChange={handleViewChange} />
              </div>
            </div>

            {isLoading && (
              <div
                className={cn(
                  filters.view === 'grid'
                    ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                    : 'flex flex-col gap-4'
                )}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <CardContent className="space-y-2 p-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && isError && (
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="font-medium text-destructive">Something went wrong</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {(error as { message?: string })?.message ?? 'Failed to load listings'}
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                    Try again
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isLoading && !isError && listings.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-4 font-medium">No listings found</p>
                  <p className="mt-1 text-center text-sm text-muted-foreground">
                    Try adjusting your search, location, or filters.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 transition-transform hover:scale-[1.02]"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isLoading && !isError && listings.length > 0 && filters.view !== 'map' && (
              <ListingsGrid listings={listings} view={filters.view} />
            )}

            {!isLoading && !isError && listings.length > 0 && filters.view === 'map' && (
              <MapView listings={listings} className="mt-4" />
            )}

            {!isLoading && !isError && listings.length > 0 && (
              <PaginationInfiniteScroll
                hasMore={hasMore}
                isLoading={isFetchingNextPage}
                onLoadMore={handleLoadMore}
              />
            )}
          </main>
        </div>
      </div>
  )
}
