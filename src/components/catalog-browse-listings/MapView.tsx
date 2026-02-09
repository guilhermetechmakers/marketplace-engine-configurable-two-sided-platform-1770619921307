import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Listing } from '@/types'

export interface MapViewProps {
  listings: Listing[]
  className?: string
}

/** Simple cluster: group by rough "cell" for demo (no real lat/lng). */
function clusterListings(listings: Listing[], cellSize = 4): { x: number; y: number; items: Listing[] }[] {
  const cells = new Map<string, Listing[]>()
  listings.forEach((listing, i) => {
    const x = Math.floor(i / cellSize) % 3
    const y = Math.floor(i / (cellSize * 3))
    const key = `${x},${y}`
    if (!cells.has(key)) cells.set(key, [])
    cells.get(key)!.push(listing)
  })
  return Array.from(cells.entries()).map(([key, items]) => {
    const [x, y] = key.split(',').map(Number)
    return { x, y, items }
  })
}

export function MapView({ listings, className }: MapViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const clusters = clusterListings(listings)
  const selected = listings.find((l) => l.id === selectedId)

  return (
    <div className={cn('relative rounded-xl border border-border bg-muted/30 overflow-hidden', className)}>
      {/* Placeholder map area with grid of "markers" */}
      <div
        className="relative min-h-[400px] w-full bg-gradient-to-br from-muted to-muted/50 p-4"
        aria-label="Map view"
      >
        <div className="absolute inset-4 grid grid-cols-3 grid-rows-auto gap-4 content-start">
          {clusters.map(({ x, y, items }) => (
            <div
              key={`${x}-${y}`}
              className="relative flex justify-center"
              style={{ gridColumn: x + 1, gridRow: 'auto' }}
            >
              <button
                type="button"
                onClick={() =>
                  setSelectedId((prev) => (prev === items[0].id ? null : items[0].id))
                }
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-card shadow-card transition-all duration-200 hover:scale-110 hover:shadow-card-hover',
                  selectedId === items[0].id && 'ring-2 ring-primary ring-offset-2'
                )}
                aria-label={`${items.length} listing(s) - ${items[0].title}`}
              >
                <MapPin className="h-5 w-5 text-primary" />
                {items.length > 1 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {items.length}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Popover listing summary */}
      {selected && (
        <Card
          className="absolute bottom-4 left-4 right-4 z-10 max-w-md border-primary/20 shadow-card animate-fade-in md:left-4 md:right-auto"
          role="dialog"
          aria-label="Listing summary"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <Badge variant="secondary" className="mb-1">
                  {selected.categoryName ?? 'Uncategorized'}
                </Badge>
                <h4 className="font-medium line-clamp-2">{selected.title}</h4>
                <p className="mt-1 text-lg font-semibold text-primary">
                  ${selected.price} {selected.currency}
                </p>
              </div>
              <Link to={`/listing/${selected.id}`}>
                <Button size="sm" className="shrink-0 transition-transform hover:scale-[1.02]">
                  View
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
