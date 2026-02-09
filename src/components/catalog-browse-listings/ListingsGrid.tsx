import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Listing } from '@/types'
import type { BrowseListingsView } from '@/types'

export interface ListingsGridProps {
  listings: Listing[]
  view: BrowseListingsView
  className?: string
}

/** Average rating for display (from attributes or mock). */
function listingRating(listing: Listing): number | null {
  const r = (listing.attributes as { rating?: number })?.rating
  if (typeof r === 'number' && r >= 0 && r <= 5) return r
  return null
}

/** Short attributes line (e.g. duration, location). */
function shortAttributes(listing: Listing): string {
  const a = listing.attributes as Record<string, unknown>
  if (!a || typeof a !== 'object') return ''
  const parts: string[] = []
  if (a.duration) parts.push(String(a.duration))
  if (a.location) parts.push(String(a.location))
  return parts.join(' · ')
}

export function ListingsGrid({ listings, view, className }: ListingsGridProps) {
  if (view === 'map') return null

  return (
    <div
      className={cn(
        view === 'grid'
          ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
          : 'flex flex-col gap-4',
        className
      )}
    >
      {listings.map((listing, i) => {
        const rating = listingRating(listing)
        const attrs = shortAttributes(listing)
        const availability = listing.status === 'active' ? 'Available' : listing.status

        return (
          <Card
            key={listing.id}
            className={cn(
              'overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
              view === 'list' && 'flex flex-row'
            )}
            style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
          >
            <Link
              to={`/listing/${listing.id}`}
              className={cn(
                'flex items-center justify-center bg-muted shrink-0',
                view === 'grid' ? 'aspect-[4/3] block' : 'w-40 aspect-[4/3]'
              )}
            >
              {listing.images?.[0] ? (
                <img
                  src={listing.images[0]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl text-muted-foreground md:text-5xl" aria-hidden>
                  📷
                </span>
              )}
            </Link>
            <CardContent className={cn('flex flex-1 flex-col', view === 'list' && 'justify-center py-4')}>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Badge variant="secondary" className="w-fit">
                  {listing.categoryName ?? 'Uncategorized'}
                </Badge>
                <Badge
                  variant={listing.status === 'active' ? 'success' : 'outline'}
                  className="w-fit"
                >
                  {availability}
                </Badge>
              </div>
              <h3 className="mt-2 font-medium line-clamp-2">{listing.title}</h3>
              <p className="mt-1 text-lg font-semibold text-primary">
                ${listing.price} {listing.currency}
              </p>
              {attrs && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{attrs}</p>
              )}
              {rating != null && (
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-accent text-accent" aria-hidden />
                  {rating.toFixed(1)}
                </p>
              )}
            </CardContent>
            <CardFooter className={cn(view === 'list' && 'flex-col items-start')}>
              <Link to={`/listing/${listing.id}`} className="w-full">
                <Button
                  className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  size="sm"
                >
                  View details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
