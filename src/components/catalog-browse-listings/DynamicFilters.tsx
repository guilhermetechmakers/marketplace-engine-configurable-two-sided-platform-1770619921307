import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CategoryConfigNode } from '@/types'

type SchemaEntry = {
  type: 'range' | 'select' | 'checkbox'
  min?: number
  max?: number
  step?: number
  options?: { value: string; label: string }[]
}

export interface DynamicFiltersProps {
  /** Schema from selected category config */
  schema: Record<string, SchemaEntry> | undefined
  values: Record<string, string | number | number[] | string[]>
  onChange: (key: string, value: string | number | number[] | string[]) => void
  className?: string
}

function collectSchema(nodes: CategoryConfigNode[]): Record<string, SchemaEntry> {
  const out: Record<string, SchemaEntry> = {}
  nodes.forEach((n) => {
    if (n.schema) Object.assign(out, n.schema)
    if (n.children?.length) Object.assign(out, collectSchema(n.children))
  })
  return out
}

export function getSchemaFromCategories(categories: CategoryConfigNode[]): Record<string, SchemaEntry> {
  return collectSchema(categories)
}

export function DynamicFilters({
  schema,
  values,
  onChange,
  className,
}: DynamicFiltersProps) {
  if (!schema || Object.keys(schema).length === 0) return null

  const entries = Object.entries(schema)

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 shadow-card space-y-4',
        className
      )}
    >
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </h3>
      <div className="space-y-4">
        {entries.map(([key, def]) => {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
          if (def.type === 'range') {
            const min = def.min ?? 0
            const max = def.max ?? 100
            const step = def.step ?? 1
            const val = (values[key] as number) ?? min
            return (
              <div key={key} className="space-y-2">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={val}
                    onChange={(e) => onChange(key, e.target.valueAsNumber)}
                    className="h-9 w-full transition-colors focus:border-primary"
                    aria-label={label}
                  />
                  <span className="text-xs text-muted-foreground shrink-0">
                    {min}–{max}
                  </span>
                </div>
              </div>
            )
          }
          if (def.type === 'select') {
            const opts = def.options ?? []
            const current = (values[key] as string) ?? opts[0]?.value ?? ''
            return (
              <div key={key} className="space-y-2">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between gap-2 h-9 text-sm font-normal transition-all hover:shadow-sm"
                      aria-label={label}
                    >
                      {opts.find((o) => o.value === current)?.label ?? (current || 'Select')}
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                    <DropdownMenuRadioGroup value={current} onValueChange={(v) => onChange(key, v)}>
                      {opts.map((o) => (
                        <DropdownMenuRadioItem key={o.value} value={o.value}>
                          {o.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          }
          if (def.type === 'checkbox') {
            const opts = def.options ?? []
            const raw = values[key]
            const current: string[] = Array.isArray(raw) ? raw.map(String) : []
            const toggle = (value: string) => {
              const next = current.includes(value)
                ? current.filter((x) => x !== value)
                : [...current, value]
              onChange(key, next)
            }
            return (
              <div key={key} className="space-y-2">
                <Label className="text-xs text-muted-foreground">{label}</Label>
                <div className="flex flex-wrap gap-2">
                  {opts.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => toggle(o.value)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:shadow-sm',
                        current.includes(o.value)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      )}
                      aria-pressed={current.includes(o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}
