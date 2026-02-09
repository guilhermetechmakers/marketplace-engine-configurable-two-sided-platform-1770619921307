import { useState } from 'react'
import { DollarSign, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type PriceType = 'single' | 'tiered' | 'hourly' | 'daily'

export interface PriceTier {
  id: string
  label: string
  amount: number
  minQuantity?: number
}

export interface PricingData {
  priceType: PriceType
  currency: string
  singlePrice?: number
  tiers?: PriceTier[]
  hourlyRate?: number
  dailyRate?: number
  taxInclusive?: boolean
  shippingEnabled?: boolean
  shippingAmount?: number
}

const CURRENCIES = ['USD', 'EUR', 'GBP']

export interface PricingModuleProps {
  value: PricingData
  onChange: (data: PricingData) => void
  className?: string
}

const defaultPricing: PricingData = {
  priceType: 'single',
  currency: 'USD',
  singlePrice: 0,
  taxInclusive: false,
  shippingEnabled: false,
  shippingAmount: 0,
}

/** Single price, tiered pricing, hourly/day rates, optional taxes & shipping. */
export function PricingModule({ value, onChange, className }: PricingModuleProps) {
  const [priceType, setPriceType] = useState<PriceType>(value.priceType ?? defaultPricing.priceType)
  const data = { ...defaultPricing, ...value }

  const update = (patch: Partial<PricingData>) => {
    onChange({ ...data, ...patch })
  }

  const addTier = () => {
    const tiers = data.tiers ?? []
    const id = `tier-${Date.now()}`
    update({
      tiers: [...tiers, { id, label: '', amount: 0, minQuantity: tiers.length + 1 }],
    })
  }

  const removeTier = (id: string) => {
    update({ tiers: (data.tiers ?? []).filter((t) => t.id !== id) })
  }

  const updateTier = (id: string, patch: Partial<PriceTier>) => {
    update({
      tiers: (data.tiers ?? []).map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })
  }

  return (
    <Card className={cn('rounded-2xl border border-border shadow-card transition-all duration-300 hover:shadow-card-hover', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-primary" />
          Pricing
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set a single price, tiers, or hourly/daily rates. Optionally add tax and shipping.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {(['single', 'tiered', 'hourly', 'daily'] as const).map((type) => (
            <Button
              key={type}
              type="button"
              variant={priceType === type ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setPriceType(type)
                update({ priceType: type })
              }}
            >
              {type === 'single' && 'Single price'}
              {type === 'tiered' && 'Tiered'}
              {type === 'hourly' && 'Hourly'}
              {type === 'daily' && 'Daily'}
            </Button>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="w-32">
            <Label className="text-xs text-muted-foreground">Currency</Label>
            <select
              value={data.currency}
              onChange={(e) => update({ currency: e.target.value })}
              className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {priceType === 'single' && (
          <div className="space-y-2">
            <Label>Price</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={data.singlePrice ?? 0}
              onChange={(e) => update({ singlePrice: e.target.valueAsNumber })}
            />
          </div>
        )}

        {priceType === 'tiered' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Tiers</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTier}>
                <Plus className="h-4 w-4 mr-1" /> Add tier
              </Button>
            </div>
            {(data.tiers ?? []).map((tier) => (
              <div key={tier.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
                <Input
                  placeholder="Label"
                  value={tier.label}
                  onChange={(e) => updateTier(tier.id, { label: e.target.value })}
                  className="flex-1 min-w-[100px]"
                />
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Amount"
                  value={tier.amount || ''}
                  onChange={(e) => updateTier(tier.id, { amount: e.target.valueAsNumber })}
                  className="w-24"
                />
                <Input
                  type="number"
                  min={1}
                  placeholder="Min qty"
                  value={tier.minQuantity ?? ''}
                  onChange={(e) => updateTier(tier.id, { minQuantity: e.target.valueAsNumber })}
                  className="w-20"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeTier(tier.id)} aria-label="Remove tier">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {priceType === 'hourly' && (
          <div className="space-y-2">
            <Label>Hourly rate</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={data.hourlyRate ?? 0}
              onChange={(e) => update({ hourlyRate: e.target.valueAsNumber })}
            />
          </div>
        )}

        {priceType === 'daily' && (
          <div className="space-y-2">
            <Label>Daily rate</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={data.dailyRate ?? 0}
              onChange={(e) => update({ dailyRate: e.target.valueAsNumber })}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-6 border-t border-border pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.taxInclusive ?? false}
              onChange={(e) => update({ taxInclusive: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <span className="text-sm">Tax included in price</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.shippingEnabled ?? false}
              onChange={(e) => update({ shippingEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <span className="text-sm">Offer shipping</span>
          </label>
          {data.shippingEnabled && (
            <div className="flex items-center gap-2">
              <Label className="text-sm">Shipping amount</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={data.shippingAmount ?? 0}
                onChange={(e) => update({ shippingAmount: e.target.valueAsNumber })}
                className="w-24"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
