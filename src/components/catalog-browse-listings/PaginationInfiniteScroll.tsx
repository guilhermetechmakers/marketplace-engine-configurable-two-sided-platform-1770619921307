import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaginationInfiniteScrollProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  className?: string
}

export function PaginationInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  className,
}: PaginationInfiniteScrollProps) {
  if (!hasMore && !isLoading) return null

  return (
    <div
      className={cn('flex justify-center py-8', className)}
      role="navigation"
      aria-label="Pagination"
    >
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-pulse" aria-hidden />
          <span className="text-sm">Loading...</span>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={onLoadMore}
          className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Load more
        </Button>
      )}
    </div>
  )
}
