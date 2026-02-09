import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Search, MapPin, Grid3X3, List, SlidersHorizontal } from 'lucide-react'

// Mock data for catalog
const MOCK_LISTINGS = [
  { id: '1', title: 'Professional photography session', price: 150, currency: 'USD', categoryName: 'Services', image: null },
  { id: '2', title: 'Cozy downtown apartment', price: 95, currency: 'USD', categoryName: 'Rentals', image: null },
  { id: '3', title: 'Vintage camera bundle', price: 320, currency: 'USD', categoryName: 'Goods', image: null },
  { id: '4', title: '1-on-1 guitar lessons', price: 60, currency: 'USD', categoryName: 'Services', image: null },
  { id: '5', title: 'Mountain cabin weekend', price: 280, currency: 'USD', categoryName: 'Rentals', image: null },
  { id: '6', title: 'Handmade leather bag', price: 180, currency: 'USD', categoryName: 'Goods', image: null },
]

export function Catalog() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Browse listings</h1>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'primary' : 'secondary'}
            size="icon"
            onClick={() => setView('grid')}
            aria-label="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'primary' : 'secondary'}
            size="icon"
            onClick={() => setView('list')}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Filters">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      <div
        className={cn(
          view === 'grid'
            ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-4'
        )}
      >
        {MOCK_LISTINGS.map((listing) => (
          <Card
            key={listing.id}
            className={cn(
              'overflow-hidden transition-all duration-300 hover:shadow-card-hover',
              view === 'list' && 'flex flex-row'
            )}
          >
            <div
              className={cn(
                'bg-muted flex items-center justify-center',
                view === 'grid' ? 'aspect-[4/3]' : 'w-40 shrink-0'
              )}
            >
              <div className="text-muted-foreground text-4xl">📷</div>
            </div>
            <CardContent className={cn(view === 'list' && 'flex-1 flex flex-col justify-center')}>
              <Badge variant="secondary" className="mb-2 w-fit">
                {listing.categoryName}
              </Badge>
              <h3 className="font-medium line-clamp-2">{listing.title}</h3>
              <p className="mt-1 text-lg font-semibold text-primary">
                ${listing.price} {listing.currency}
              </p>
            </CardContent>
            <CardFooter className={cn(view === 'list' && 'flex-col items-start')}>
              <Link to={`/listing/${listing.id}`} className="w-full">
                <Button className="w-full" size="sm">
                  View details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center py-4">
        <Button variant="secondary">Load more</Button>
      </div>
    </div>
  )
}
