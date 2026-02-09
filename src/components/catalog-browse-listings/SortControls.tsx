import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BrowseListingsSort } from '@/types'

const SORT_OPTIONS: { value: BrowseListingsSort; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
]

export interface SortControlsProps {
  value: BrowseListingsSort
  onChange: (value: BrowseListingsSort) => void
  className?: string
}

export function SortControls({ value, onChange, className }: SortControlsProps) {
  const label = SORT_OPTIONS.find((o) => o.value === value)?.label ?? 'Sort'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'min-w-[160px] justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-card active:scale-[0.98]',
            className
          )}
          aria-label="Sort by"
        >
          <ArrowUpDown className="h-4 w-4 shrink-0" />
          {label}
          <ChevronDown className="h-4 w-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as BrowseListingsSort)}>
          {SORT_OPTIONS.map((opt) => (
            <DropdownMenuRadioItem key={opt.value} value={opt.value}>
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
