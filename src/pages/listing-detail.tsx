import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { MessageCircle, Share2, Heart } from 'lucide-react'

const MOCK_LISTING = {
  id: '1',
  title: 'Professional photography session',
  description: 'A 2-hour outdoor or studio photography session. Includes edited high-res images. Perfect for portraits, headshots, or small events.',
  price: 150,
  currency: 'USD',
  categoryName: 'Services',
  seller: { id: 's1', displayName: 'Alex Photo', email: 'alex@example.com' },
  attributes: { duration: '2 hours', location: 'Flexible' },
}

export function ListingDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6 animate-in">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Media */}
          <div className="aspect-[4/3] rounded-2xl border border-border bg-muted flex items-center justify-center overflow-hidden">
            <span className="text-6xl">📷</span>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{MOCK_LISTING.categoryName}</Badge>
                <Badge variant="outline">Verified</Badge>
              </div>
              <h1 className="text-2xl font-semibold">{MOCK_LISTING.title}</h1>
              <p className="text-3xl font-semibold text-primary">
                ${MOCK_LISTING.price} {MOCK_LISTING.currency}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{MOCK_LISTING.description}</p>
              <Separator />
              <h3 className="font-medium">Details</h3>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                <li>Duration: {String((MOCK_LISTING.attributes as { duration?: string }).duration)}</li>
                <li>Location: {String((MOCK_LISTING.attributes as { location?: string }).location)}</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: booking + seller */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader>
              <p className="text-2xl font-semibold">
                ${MOCK_LISTING.price} <span className="text-sm font-normal text-muted-foreground">/ session</span>
              </p>
              <Link to={`/checkout/${id}`}>
                <Button className="w-full" size="lg">
                  Book now
                </Button>
              </Link>
              <Button variant="secondary" className="w-full" size="lg">
                Request quote
              </Button>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarImage src="" />
                <AvatarFallback>{MOCK_LISTING.seller.displayName?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{MOCK_LISTING.seller.displayName}</p>
                <Badge variant="verified" className="text-xs">Verified seller</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Link to="/messages" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full gap-1">
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Button>
              </Link>
              <Button variant="outline" size="icon" aria-label="Share">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Save">
                <Heart className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
