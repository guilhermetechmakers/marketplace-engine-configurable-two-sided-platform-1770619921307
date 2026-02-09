import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home } from 'lucide-react'

export function ErrorPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 animate-in">
      <AlertCircle className="h-16 w-16 text-destructive mb-4" />
      <p className="text-6xl font-bold text-muted-foreground">500</p>
      <h1 className="mt-4 text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-center text-muted-foreground max-w-sm">
        We&apos;re sorry. Please try again or return home.
      </p>
      <Link to="/" className="mt-8">
        <Button className="gap-2">
          <Home className="h-4 w-4" />
          Go home
        </Button>
      </Link>
    </div>
  )
}
