import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Sentry } from '@/lib/sentry'
import { ErrorBoundaryFallback } from '@/components/monitoring/ErrorBoundaryFallback'
import { router } from '@/routes'
import { AuthProvider } from '@/contexts/auth-context'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 },
  },
})

export default function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorBoundaryFallback
          error={error instanceof Error ? error : undefined}
          resetError={resetError}
        />
      )}
      showDialog={false}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  )
}
