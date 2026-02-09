import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CategoryConfigNode } from '@/types'

export interface CategoryFacetsProps {
  /** Hierarchical category tree from config */
  categories: CategoryConfigNode[]
  selectedIds: string[]
  onToggle: (id: string) => void
  className?: string
}

function CategoryNode({
  node,
  selectedIds,
  onToggle,
  depth = 0,
}: {
  node: CategoryConfigNode
  selectedIds: string[]
  onToggle: (id: string) => void
  depth?: number
}) {
  const isSelected = selectedIds.includes(node.id)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className="flex flex-col" style={{ paddingLeft: depth ? 16 : 0 }}>
      <button
        type="button"
        onClick={() => onToggle(node.id)}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 hover:bg-muted hover:shadow-sm',
          isSelected && 'bg-primary/10 font-medium text-primary'
        )}
        aria-pressed={isSelected}
        aria-label={`${node.name}${isSelected ? ', selected' : ''}`}
      >
        {hasChildren && (
          <ChevronRight
            className={cn('h-4 w-4 shrink-0 transition-transform', isSelected && 'rotate-90')}
            aria-hidden
          />
        )}
        <span className="flex-1">{node.name}</span>
      </button>
      {hasChildren &&
        node.children!.map((child) => (
          <CategoryNode
            key={child.id}
            node={child}
            selectedIds={selectedIds}
            onToggle={onToggle}
            depth={depth + 1}
          />
        ))}
    </div>
  )
}

export function CategoryFacets({
  categories,
  selectedIds,
  onToggle,
  className,
}: CategoryFacetsProps) {
  return (
    <nav
      className={cn('rounded-xl border border-border bg-card p-4 shadow-card', className)}
      aria-label="Category filters"
    >
      <h3 className="mb-3 text-sm font-semibold text-foreground">Categories</h3>
      <div className="space-y-0.5">
        {categories.map((node) => (
          <CategoryNode
            key={node.id}
            node={node}
            selectedIds={selectedIds}
            onToggle={onToggle}
          />
        ))}
      </div>
    </nav>
  )
}
