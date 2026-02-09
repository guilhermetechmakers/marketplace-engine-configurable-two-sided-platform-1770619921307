import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Listing } from '@/types'
import { useListingsQuery } from '@/hooks/use-listings'
import { useOrdersQuery } from '@/hooks/use-orders'
import { Search, MapPin, Grid3X3, List, SlidersHorizontal, Package, ChevronRight, Sparkles } from 'lucide-react'

export function Catalog() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const { data, isLoading, isError, error, refetch } = useListingsQuery({ q: search || undefined, limit: 24 })
  const { data: ordersData } = useOrdersQuery({ role: 'buyer' })

  const listings = data?.listings ?? []
  const filteredByLocation = useMemo(() => {
    if (!location.trim()) return listings
    const loc = location.toLowerCase()
    return listings.filter(
      (l: Listing) =>
        (l.attributes as { location?: string })?.location?.toLowerCase().includes(loc) ||
        l.title.toLowerCase().includes(loc)
    )
  }, [listings, location])

  const orderSummary = ordersData?.orders?.length ?? 0
  const lastOrder = ordersData?.orders?.[0]

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Browse listings</h1>
          <p className="mt-1 text-muted-foreground">Find services, rentals, and goods</p>
        </div>
      </div>

      {/* Order summary card - Buyer dashboard */}
      {orderSummary > 0 && (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-card transition-all duration-300 hover:shadow-card-hover">
          <CardContent className="flex flex-row items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Your orders</p>
                <p className="text-sm text-muted-foreground">
                  {orderSummary} order{orderSummary !== 1 ? 's' : ''} · {lastOrder ? `Last: #${lastOrder.id}` : ''}
                </p>
              </div>
            </div>
            <Link to="/dashboard/orders">
              <Button variant="secondary" size="sm" className="gap-1">
                View orders
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recommendations section */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Recommended for you</h2>
        </div>
      </section>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-card md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 transition-colors focus:border-primary"
            aria-label="Search listings"
          />
        </div>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-9 transition-colors focus:border-primary"
            aria-label="Filter by location"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'primary' : 'secondary'}
            size="icon"
            onClick={() => setView('grid')}
            aria-label="Grid view"
            className="transition-transform hover:scale-[1.02]"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'primary' : 'secondary'}
            size="icon"
            onClick={() => setView('list')}
            aria-label="List view"
            className="transition-transform hover:scale-[1.02]"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Filters" className="transition-transform hover:scale-[1.02]">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      {isLoading && (
        <div
          className={cn(
            view === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-4'
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-20" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full rounded-lg" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="font-medium text-destructive">Something went wrong</p>
            <p className="mt-1 text-sm text-muted-foreground">{error?.message ?? 'Failed to load listings'}</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && filteredByLocation.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 font-medium">No listings found</p>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Try adjusting your search or filters, or browse all categories.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSearch('')
                setLocation('')
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && filteredByLocation.length > 0 && (
        <div
          className={cn(
            view === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-4'
          )}
        >
          {filteredByLocation.map((listing: Listing, i: number) => (
            <Card
              key={listing.id}
              className={cn(
                'overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
                view === 'list' && 'flex flex-row'
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Link
                to={`/listing/${listing.id}`}
                className={cn(
                  'bg-muted flex items-center justify-center',
                  view === 'grid' ? 'aspect-[4/3] block' : 'w-40 shrink-0'
                )}
              >
                <span className="text-4xl text-muted-foreground md:text-5xl">📷</span>
              </Link>
              <CardContent className={cn(view === 'list' && 'flex flex-1 flex-col justify-center')}>
                <Badge variant="secondary" className="mb-2 w-fit">
                  {listing.categoryName ?? 'Uncategorized'}
                </Badge>
                <h3 className="font-medium line-clamp-2">{listing.title}</h3>
                <p className="mt-1 text-lg font-semibold text-primary">
                  ${listing.price} {listing.currency}
                </p>
              </CardContent>
              <CardFooter className={cn(view === 'list' && 'flex-col items-start')}>
                <Link to={`/listing/${listing.id}`} className="w-full">
                  <Button className="w-full transition-transform hover:scale-[1.02]" size="sm">
                    View details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !isError && filteredByLocation.length > 0 && (
        <div className="flex justify-center py-4">
          <Button variant="secondary" className="transition-transform hover:scale-[1.02]">
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
