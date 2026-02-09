import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 animate-in">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-center text-muted-foreground max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Link to="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
        <Link to="/catalog">
          <Button variant="secondary" className="gap-2">
            <Search className="h-4 w-4" />
            Browse
          </Button>
        </Link>
      </div>
    </div>
  )
}
