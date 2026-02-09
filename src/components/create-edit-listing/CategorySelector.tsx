import { FolderTree } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ListingCategorySchema } from '@/types'

export interface CategorySelectorProps {
  /** Available category schemas (loaded from config). */
  schemas: ListingCategorySchema[]
  /** Currently selected category id. */
  value: string
  onChange: (categoryId: string) => void
  disabled?: boolean
  className?: string
}

/** Choose category which loads the listing form schema. */
export function CategorySelector({
  schemas,
  value,
  onChange,
  disabled,
  className,
}: CategorySelectorProps) {
  const selected = schemas.find((s) => s.categoryId === value)

  return (
    <Card className={cn('rounded-2xl border border-border shadow-card transition-all duration-300 hover:shadow-card-hover', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FolderTree className="h-5 w-5 text-primary" />
          Category
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a category to load the right fields for your listing.
        </p>
      </CardHeader>
      <CardContent>
        <Label className="sr-only">Listing category</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className="w-full justify-between gap-2 rounded-lg border-input transition-all hover:border-primary hover:shadow-sm"
              aria-label="Select category"
            >
              <span className="truncate">
                {selected ? selected.categoryName : 'Select category'}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
            <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
              {schemas.map((s) => (
                <DropdownMenuRadioItem key={s.categoryId} value={s.categoryId}>
                  {s.categoryName}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}
