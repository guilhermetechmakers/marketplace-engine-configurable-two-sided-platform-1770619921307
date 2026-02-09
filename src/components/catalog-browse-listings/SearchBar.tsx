import { useState, useRef, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, MapPin, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RADIUS_OPTIONS_KM, LOCATION_SUGGESTIONS } from '@/config/catalog-browse-listings'

export interface SearchBarProps {
  keyword: string
  location: string
  radiusKm: number
  onKeywordChange: (value: string) => void
  onLocationChange: (value: string) => void
  onRadiusChange: (value: number) => void
  onSearch?: () => void
  className?: string
  placeholderKeyword?: string
  placeholderLocation?: string
}

export function SearchBar({
  keyword,
  location,
  radiusKm,
  onKeywordChange,
  onLocationChange,
  onRadiusChange,
  onSearch,
  className,
  placeholderKeyword = 'Search by keyword...',
  placeholderLocation = 'City or address',
}: SearchBarProps) {
  const [locationFocused, setLocationFocused] = useState(false)
  const [locationInput, setLocationInput] = useState(location)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocationInput(location)
  }, [location])

  const suggestions = locationInput.trim()
    ? LOCATION_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(locationInput.toLowerCase())
      ).slice(0, 5)
    : LOCATION_SUGGESTIONS.slice(0, 5)

  const handleLocationSelect = useCallback(
    (value: string) => {
      setLocationInput(value)
      onLocationChange(value)
      setLocationFocused(false)
    },
    [onLocationChange]
  )

  const handleLocationBlur = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setLocationFocused(false), 150)
  }, [])

  const handleLocationFocus = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setLocationFocused(true)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter') handleLocationSelect(value)
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:flex-wrap sm:items-center',
        className
      )}
    >
      <div className="relative flex-1 min-w-[200px]">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder={placeholderKeyword}
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
          className="pl-9 transition-colors focus:border-primary"
          aria-label="Search by keyword"
        />
      </div>

      <div className="relative flex-1 min-w-[200px]">
        <MapPin
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder={placeholderLocation}
          value={locationInput}
          onChange={(e) => {
            setLocationInput(e.target.value)
            onLocationChange(e.target.value)
          }}
          onFocus={handleLocationFocus}
          onBlur={handleLocationBlur}
          onKeyDown={(e) => e.key === 'Enter' && suggestions[0] && handleLocationSelect(suggestions[0])}
          className="pl-9 transition-colors focus:border-primary"
          aria-label="Location"
          aria-autocomplete="list"
          aria-expanded={locationFocused}
          role="combobox"
        />
        {locationFocused && suggestions.length > 0 && (
          <ul
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-auto rounded-lg border border-border bg-card py-1 shadow-card animate-fade-in"
            role="listbox"
          >
            {suggestions.map((s) => (
              <li
                key={s}
                role="option"
                tabIndex={0}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                onMouseDown={() => handleLocationSelect(s)}
                onKeyDown={(e) => handleKeyDown(e, s)}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[120px] justify-between gap-2 transition-all hover:scale-[1.02] hover:shadow-card active:scale-[0.98]"
            aria-label="Select radius"
          >
            {radiusKm} km
            <ChevronDown className="h-4 w-4 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuRadioGroup
            value={String(radiusKm)}
            onValueChange={(v) => onRadiusChange(Number(v))}
          >
            {RADIUS_OPTIONS_KM.map((r) => (
              <DropdownMenuRadioItem key={r} value={String(r)}>
                {r} km
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {onSearch && (
        <Button
          onClick={onSearch}
          className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Search
        </Button>
      )}
    </div>
  )
}
