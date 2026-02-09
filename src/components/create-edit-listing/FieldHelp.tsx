import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FieldHelpProps {
  /** Inline hint (alias: hint) */
  help?: string
  hint?: string
  example?: string
  className?: string
}

/** Inline hints and examples for form fields. */
export function FieldHelp({ help, hint, example, className }: FieldHelpProps) {
  const displayHelp = help ?? hint
  if (!displayHelp && !example) return null
  return (
    <div
      className={cn(
        'mt-1.5 flex items-start gap-2 text-xs text-muted-foreground',
        className
      )}
      role="note"
      aria-live="polite"
    >
      {displayHelp && (
        <span className="flex items-center gap-1">
          <HelpCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
          {displayHelp}
        </span>
      )}
      {example && (
        <span className="shrink-0">
          Example: <em className="text-foreground/80">{example}</em>
        </span>
      )}
    </div>
  )
}
