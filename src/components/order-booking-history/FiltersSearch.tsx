import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, ChevronDown, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

const MODE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'checkout', label: 'Checkout' },
  { value: 'booking', label: 'Booking' },
  { value: 'inquiry', label: 'Inquiry' },
]

export interface OrderFiltersState {
  status: string
  transaction_mode: string
  date_from: string
  date_to: string
  search: string
}

interface FiltersSearchProps {
  filters: OrderFiltersState
  onFiltersChange: (f: Partial<OrderFiltersState>) => void
  onApply?: () => void
  className?: string
}

export function FiltersSearch({
  filters,
  onFiltersChange,
  onApply,
  className,
}: FiltersSearchProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center',
        className
      )}
    >
      <div className="relative w-full min-w-[200px] sm:w-56">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder="Search by title or ID…"
          className="pl-9 transition-colors focus:border-primary"
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          aria-label="Search orders"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[140px] justify-between gap-2 transition-all hover:shadow-card"
          >
            {STATUS_OPTIONS.find((o) => o.value === filters.status)?.label ?? 'Status'}
            <ChevronDown className="h-4 w-4 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuRadioGroup
            value={filters.status}
            onValueChange={(v) => onFiltersChange({ status: v })}
          >
            {STATUS_OPTIONS.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[140px] justify-between gap-2 transition-all hover:shadow-card"
          >
            {MODE_OPTIONS.find((o) => o.value === filters.transaction_mode)?.label ?? 'Type'}
            <ChevronDown className="h-4 w-4 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuRadioGroup
            value={filters.transaction_mode}
            onValueChange={(v) => onFiltersChange({ transaction_mode: v })}
          >
            {MODE_OPTIONS.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            type="date"
            className="w-full sm:w-40 transition-colors focus:border-primary"
            value={filters.date_from}
            onChange={(e) => onFiltersChange({ date_from: e.target.value })}
            aria-label="Date from"
          />
        </div>
        <span className="text-muted-foreground text-sm hidden sm:inline">–</span>
        <Input
          type="date"
          className="w-full sm:w-40 transition-colors focus:border-primary"
          value={filters.date_to}
          onChange={(e) => onFiltersChange({ date_to: e.target.value })}
          aria-label="Date to"
        />
      </div>

      {onApply && (
        <Button
          onClick={onApply}
          className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Apply filters
        </Button>
      )}
    </div>
  )
}
