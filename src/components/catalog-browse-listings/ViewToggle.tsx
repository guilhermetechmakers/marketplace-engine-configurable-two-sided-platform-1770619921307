import { Button } from '@/components/ui/button'
import { Grid3X3, List, Map } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BrowseListingsView } from '@/types'

const VIEWS: { value: BrowseListingsView; label: string; icon: typeof Grid3X3 }[] = [
  { value: 'grid', label: 'Grid', icon: Grid3X3 },
  { value: 'list', label: 'List', icon: List },
  { value: 'map', label: 'Map', icon: Map },
]

export interface ViewToggleProps {
  value: BrowseListingsView
  onChange: (value: BrowseListingsView) => void
  className?: string
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn('inline-flex rounded-lg border border-border bg-card p-1 shadow-sm', className)}
      role="group"
      aria-label="View mode"
    >
      {VIEWS.map(({ value: v, label, icon: Icon }) => (
        <Button
          key={v}
          variant={value === v ? 'primary' : 'ghost'}
          size="icon"
          onClick={() => onChange(v)}
          className={cn(
            'h-9 w-9 transition-all duration-200',
            value === v ? 'shadow-sm' : 'hover:scale-105'
          )}
          aria-label={`${label} view`}
          aria-pressed={value === v}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  )
}
