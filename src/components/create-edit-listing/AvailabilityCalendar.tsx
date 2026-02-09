import { useState } from 'react'
import { Calendar, Clock, Ban } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface RecurringSlot {
  id: string
  dayOfWeek: number
  start: string
  end: string
}

export interface AvailabilityData {
  /** Single-item: available from this date */
  availableFrom?: string
  /** Single-item: available until this date */
  availableUntil?: string
  /** Recurring weekly slots (0 = Sunday, 6 = Saturday) */
  recurring?: RecurringSlot[]
  /** Blackout dates (YYYY-MM-DD) for booking mode */
  blackoutDates?: string[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export interface AvailabilityCalendarProps {
  value: AvailabilityData
  onChange: (data: AvailabilityData) => void
  /** When true, show blackout dates (booking mode). */
  bookingMode?: boolean
  className?: string
}

/** Single-item availability, recurring schedule, blackout dates (for booking mode). */
export function AvailabilityCalendar({
  value,
  onChange,
  bookingMode = true,
  className,
}: AvailabilityCalendarProps) {
  const [tab, setTab] = useState<'single' | 'recurring' | 'blackout'>('single')
  const data = value ?? {}

  const update = (patch: Partial<AvailabilityData>) => {
    onChange({ ...data, ...patch })
  }

  const addRecurring = () => {
    const recurring = data.recurring ?? []
    update({
      recurring: [...recurring, { id: `r-${Date.now()}`, dayOfWeek: 1, start: '09:00', end: '17:00' }],
    })
  }

  const removeRecurring = (id: string) => {
    update({ recurring: (data.recurring ?? []).filter((r) => r.id !== id) })
  }

  const updateRecurring = (id: string, patch: Partial<RecurringSlot>) => {
    update({
      recurring: (data.recurring ?? []).map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })
  }

  const addBlackout = (date: string) => {
    const blackout = data.blackoutDates ?? []
    if (date && !blackout.includes(date)) update({ blackoutDates: [...blackout, date].sort() })
  }

  const removeBlackout = (date: string) => {
    update({ blackoutDates: (data.blackoutDates ?? []).filter((d) => d !== date) })
  }

  return (
    <Card className={cn('rounded-2xl border border-border shadow-card transition-all duration-300 hover:shadow-card-hover', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Availability
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set when this listing is available and optional blackout dates for booking.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 border-b border-border pb-2">
          {(['single', 'recurring', 'blackout'] as const).map((t) => (
            <Button
              key={t}
              type="button"
              variant={tab === t ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTab(t)}
            >
              {t === 'single' && 'Date range'}
              {t === 'recurring' && 'Recurring'}
              {t === 'blackout' && 'Blackout'}
            </Button>
          ))}
        </div>

        {tab === 'single' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Available from</Label>
              <input
                type="date"
                value={data.availableFrom ?? ''}
                onChange={(e) => update({ availableFrom: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <Label>Available until</Label>
              <input
                type="date"
                value={data.availableUntil ?? ''}
                onChange={(e) => update({ availableUntil: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        )}

        {tab === 'recurring' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1"><Clock className="h-4 w-4" /> Weekly schedule</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRecurring}>
                Add slot
              </Button>
            </div>
            {(data.recurring ?? []).map((slot) => (
              <div key={slot.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
                <select
                  value={slot.dayOfWeek}
                  onChange={(e) => updateRecurring(slot.id, { dayOfWeek: Number(e.target.value) })}
                  className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {DAYS.map((d, i) => (
                    <option key={d} value={i}>{d}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={slot.start}
                  onChange={(e) => updateRecurring(slot.id, { start: e.target.value })}
                  className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <span className="text-muted-foreground">–</span>
                <input
                  type="time"
                  value={slot.end}
                  onChange={(e) => updateRecurring(slot.id, { end: e.target.value })}
                  className="h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeRecurring(slot.id)} aria-label="Remove slot">
                  <Ban className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {tab === 'blackout' && bookingMode && (
          <div className="space-y-4">
            <Label className="flex items-center gap-1"><Ban className="h-4 w-4" /> Blackout dates</Label>
            <div className="flex flex-wrap gap-2">
              <input
                type="date"
                id="blackout-date"
                className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onBlur={(e) => e.target.value && addBlackout(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const el = e.target as HTMLInputElement
                    if (el.value) addBlackout(el.value)
                  }
                }}
              />
            </div>
            {(data.blackoutDates ?? []).length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {(data.blackoutDates ?? []).map((d) => (
                  <li key={d}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => removeBlackout(d)}
                    >
                      {d} ×
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
