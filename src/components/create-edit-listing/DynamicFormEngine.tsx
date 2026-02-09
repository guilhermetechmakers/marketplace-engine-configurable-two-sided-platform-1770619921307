import { useMemo } from 'react'
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
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ListingFormFieldSchema, ListingFormFieldType } from '@/types'
import { FieldHelp } from './FieldHelp'

export interface DynamicFormEngineProps {
  fields: ListingFormFieldSchema[]
  values: Record<string, string | number | boolean | string[]>
  onChange: (key: string, value: string | number | boolean | string[]) => void
  errors?: Record<string, string>
  className?: string
}

function isVisible(
  field: ListingFormFieldSchema,
  values: Record<string, string | number | boolean | string[]>
): boolean {
  if (!field.showWhen) return true
  const v = values[field.showWhen.field]
  return field.showWhen.oneOf.some((x) => x === v)
}

/** Renders fields (text, number, select, multi-select, date, location, boolean, rich-text) and validations. */
export function DynamicFormEngine({
  fields,
  values,
  onChange,
  errors = {},
  className,
}: DynamicFormEngineProps) {
  const visibleFields = useMemo(
    () => fields.filter((f) => isVisible(f, values)),
    [fields, values]
  )

  return (
    <div className={cn('space-y-6', className)}>
      {visibleFields.map((field) => (
        <div key={field.key} className="space-y-2 animate-in fade-in-up duration-300">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={field.key} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
          </div>
          <FieldRenderer
            field={field}
            value={values[field.key]}
            onChange={(v) => onChange(field.key, v)}
            error={errors[field.key]}
          />
          <FieldHelp hint={field.hint} example={field.example} />
        </div>
      ))}
    </div>
  )
}

function FieldRenderer({
  field,
  value,
  onChange,
  error,
}: {
  field: ListingFormFieldSchema
  value: string | number | boolean | string[] | undefined
  onChange: (v: string | number | boolean | string[]) => void
  error?: string
}) {
  const type = field.type as ListingFormFieldType
  const id = field.key

  if (type === 'text' || type === 'rich-text') {
    return (
      <>
        <textarea
          id={id}
          rows={type === 'rich-text' ? 5 : 2}
          placeholder={field.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:opacity-50',
            error && 'border-destructive'
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error && (
          <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </>
    )
  }

  if (type === 'number') {
    return (
      <>
        <Input
          id={id}
          type="number"
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          placeholder={field.placeholder}
          value={(value as number) ?? ''}
          onChange={(e) => onChange(e.target.valueAsNumber)}
          className={cn(error && 'border-destructive')}
          aria-invalid={!!error}
        />
        {error && (
          <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </>
    )
  }

  if (type === 'select') {
    const opts = field.options ?? []
    const current = (value as string) ?? opts[0]?.value ?? ''
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              id={id}
              className={cn('w-full justify-between gap-2 font-normal', error && 'border-destructive')}
              aria-invalid={!!error}
            >
              {opts.find((o) => o.value === current)?.label ?? (current || 'Select')}
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
            <DropdownMenuRadioGroup value={current} onValueChange={(v) => onChange(v)}>
              {opts.map((o) => (
                <DropdownMenuRadioItem key={o.value} value={o.value}>
                  {o.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        {error && (
          <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </>
    )
  }

  if (type === 'multi-select') {
    const opts = field.options ?? []
    const current: string[] = Array.isArray(value) ? value.map(String) : []
    const toggle = (v: string) => {
      const next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v]
      onChange(next)
    }
    return (
      <>
        <div className="flex flex-wrap gap-2">
          {opts.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:shadow-sm',
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
        {error && (
          <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </>
    )
  }

  if (type === 'date') {
    return (
      <>
        <Input
          id={id}
          type="date"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn(error && 'border-destructive')}
          aria-invalid={!!error}
        />
        {error && (
          <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </>
    )
  }

  if (type === 'location') {
    return (
      <>
        <Input
          id={id}
          type="text"
          placeholder={field.placeholder ?? 'City, address, or area'}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn(error && 'border-destructive')}
          aria-invalid={!!error}
        />
        {error && (
          <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </>
    )
  }

  if (type === 'boolean') {
    const checked = value === true || value === 'true'
    return (
      <>
        <div className="flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 rounded-full border border-input transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              checked ? 'bg-primary' : 'bg-muted'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
                checked ? 'translate-x-5' : 'translate-x-0.5'
              )}
              style={{ marginTop: 2 }}
            />
          </button>
          <span className="text-sm text-muted-foreground">{checked ? 'Yes' : 'No'}</span>
        </div>
        {error && (
          <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </>
    )
  }

  return (
    <Input
      id={id}
      type="text"
      placeholder={field.placeholder}
      value={(value as string) ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={cn(error && 'border-destructive')}
      aria-invalid={!!error}
    />
  )
}
