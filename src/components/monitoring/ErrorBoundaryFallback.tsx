import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export interface ErrorBoundaryFallbackProps {
  error?: unknown
  resetError?: () => void
}

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error !== null && typeof error === 'object' && 'message' in error) {
    const obj = error as Record<string, unknown>
    return obj.message != null ? String(obj.message) : undefined
  }
  return undefined
}

export function ErrorBoundaryFallback({ error, resetError }: ErrorBoundaryFallbackProps) {
  const message = getErrorMessage(error)
  return (
    <div
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 animate-in"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="mb-4 h-16 w-16 text-destructive" aria-hidden />
      <p className="text-6xl font-bold text-muted-foreground">500</p>
      <h1 className="mt-4 text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-center text-muted-foreground">
        We&apos;re sorry. This error has been reported. Please try again or return home.
      </p>
      {message && (
        <p className="mt-2 max-w-md truncate text-center text-sm text-muted-foreground" title={message}>
          {message}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {resetError && (
          <Button type="button" variant="outline" className="gap-2" onClick={resetError}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )}
        <Link to="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Go home
          </Button>
        </Link>
      </div>
    </div>
  )
}
