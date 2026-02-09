import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const MOCK_LISTINGS = [
  { id: '1', title: 'Professional photography session', price: 150, status: 'active' },
  { id: '2', title: 'Cozy downtown apartment', price: 95, status: 'draft' },
  { id: '3', title: '1-on-1 guitar lessons', price: 60, status: 'active' },
]

const statusVariant = (s: string) =>
  s === 'active' ? 'success' : s === 'draft' ? 'secondary' : 'outline'

export function DashboardProjects() {
  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Listings</h1>
          <p className="text-muted-foreground">Manage your listings</p>
        </div>
        <Link to="/listing/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New listing
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_LISTINGS.map((listing) => (
          <Card key={listing.id} className="overflow-hidden transition-shadow hover:shadow-card-hover">
            <div className="aspect-[4/3] bg-muted flex items-center justify-center">
              <span className="text-4xl">📷</span>
            </div>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium line-clamp-2">{listing.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/listing/${listing.id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="mt-1 text-lg font-semibold text-primary">${listing.price}</p>
              <Badge variant={statusVariant(listing.status)} className="mt-2">
                {listing.status}
              </Badge>
            </CardContent>
            <CardFooter>
              <Link to={`/listing/${listing.id}`} className="w-full">
                <Button variant="secondary" size="sm" className="w-full">
                  View
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Add another listing</p>
          <Link to="/listing/new">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              New listing
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
