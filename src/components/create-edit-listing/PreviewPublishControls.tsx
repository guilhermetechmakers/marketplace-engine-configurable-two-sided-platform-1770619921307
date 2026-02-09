import { Save, CheckCircle, Send, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface PreviewPublishControlsProps {
  onSaveDraft: () => void
  onValidate: () => void
  onPublish: () => void
  onSchedulePublish?: (date: string) => void
  isSaving?: boolean
  isValidating?: boolean
  isPublishing?: boolean
  validationErrors?: string[]
  className?: string
}

/** Save draft, validate, publish, schedule publish. */
export function PreviewPublishControls({
  onSaveDraft,
  onValidate,
  onPublish,
  onSchedulePublish,
  isSaving,
  isValidating,
  isPublishing,
  validationErrors = [],
  className,
}: PreviewPublishControlsProps) {
  const busy = isSaving || isValidating || isPublishing

  return (
    <Card className={cn('rounded-2xl border border-border shadow-card transition-all duration-300 hover:shadow-card-hover', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Preview &amp; Publish</CardTitle>
        <p className="text-sm text-muted-foreground">
          Save as draft, validate your listing, or publish now / schedule for later.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationErrors.length > 0 && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onSaveDraft}
            disabled={busy}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving…' : 'Save draft'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onValidate}
            disabled={busy}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isValidating ? 'Validating…' : 'Validate'}
          </Button>
          <Button
            type="button"
            onClick={onPublish}
            disabled={busy}
            className="transition-transform hover:scale-[1.02] hover:shadow-card-hover active:scale-[0.98]"
          >
            <Send className="h-4 w-4 mr-2" />
            {isPublishing ? 'Publishing…' : 'Publish'}
          </Button>
        </div>

        {onSchedulePublish && (
          <div className="flex flex-wrap items-end gap-2 pt-2 border-t border-border">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Schedule publish</Label>
              <Input
                type="datetime-local"
                id="schedule-publish"
                className="w-full sm:w-auto"
                onChange={(e) => e.target.value && onSchedulePublish(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                const el = document.getElementById('schedule-publish') as HTMLInputElement
                if (el?.value) onSchedulePublish(el.value)
              }}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Schedule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
