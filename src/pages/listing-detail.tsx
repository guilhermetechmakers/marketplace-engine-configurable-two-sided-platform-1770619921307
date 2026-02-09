import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useListingQuery } from '@/hooks/use-listings'
import { MessageCircle, Share2, Heart, Star, ArrowLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, error, refetch } = useListingQuery(id)

  const listing = data?.listing
  const reviews = data?.reviews ?? []

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <Card>
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-10 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !listing) {
    return (
      <div className="space-y-6 animate-in">
        <Link
          to="/catalog"
          className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to catalog
        </Link>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="font-medium text-destructive">Listing not found</p>
            <p className="mt-1 text-sm text-muted-foreground">{error?.message ?? 'This listing may have been removed.'}</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Try again
            </Button>
            <Link to="/catalog" className="mt-2">
              <Button variant="secondary">Browse catalog</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const attrs = (listing.attributes ?? {}) as Record<string, unknown>
  const initials = listing.seller?.displayName?.slice(0, 2).toUpperCase() ?? 'SL'

  return (
    <div className="space-y-6 animate-in">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/catalog" className="transition-colors hover:text-foreground">
          Catalog
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground truncate">{listing.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Media */}
          <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted shadow-card">
            {listing.images?.[0] ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-6xl md:text-7xl" aria-hidden>📷</span>
              </div>
            )}
          </div>

          <Card className="overflow-hidden shadow-card transition-shadow duration-300 hover:shadow-card-hover">
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{listing.categoryName ?? 'Uncategorized'}</Badge>
                <Badge variant="verified" className="text-xs">Verified</Badge>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{listing.title}</h1>
              <p className="text-3xl font-semibold text-primary">
                ${listing.price} {listing.currency}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
              <Separator />
              <h3 className="font-medium">Details</h3>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                {Object.entries(attrs).map(([key, value]) => (
                  <li key={key}>
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>{' '}
                    {String(value)}
                  </li>
                ))}
                {Object.keys(attrs).length === 0 && (
                  <li>No additional details.</li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Reviews */}
          {reviews.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="font-medium flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent fill-accent" />
                  Reviews ({reviews.length})
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn('h-4 w-4', star <= r.rating ? 'text-accent fill-accent' : 'text-muted-foreground')}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{r.author?.displayName ?? 'Anonymous'}</span>
                      <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    {r.body && <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: booking + seller */}
        <div className="space-y-4">
          <Card className="sticky top-20 overflow-hidden border-primary/20 shadow-card transition-all duration-300 hover:shadow-card-hover">
            <CardHeader className="space-y-4">
              <p className="text-2xl font-semibold">
                ${listing.price}{' '}
                <span className="text-sm font-normal text-muted-foreground">/ session</span>
              </p>
              <Link to={`/checkout/${listing.id}`}>
                <Button className="w-full transition-transform hover:scale-[1.02]" size="lg">
                  Book now
                </Button>
              </Link>
              <Button variant="secondary" className="w-full transition-transform hover:scale-[1.02]" size="lg">
                Request quote
              </Button>
            </CardHeader>
          </Card>

          <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
            <CardHeader className="flex flex-row items-center gap-3">
              <Avatar className="h-14 w-14 shrink-0 border-2 border-border">
                <AvatarImage src={listing.seller?.avatarUrl} alt={listing.seller?.displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium truncate">{listing.seller?.displayName ?? 'Seller'}</p>
                <Badge variant="verified" className="text-xs mt-0.5">Verified seller</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Link to="/dashboard/messages" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full gap-1 transition-transform hover:scale-[1.02]">
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Button>
              </Link>
              <Button variant="outline" size="icon" aria-label="Share" className="transition-transform hover:scale-[1.02]">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Save" className="transition-transform hover:scale-[1.02]">
                <Heart className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
