import * as React from 'react'
import { cn } from '@/lib/utils'

const OTP_LENGTH = 6

export interface InputOTPProps {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  error?: boolean
  className?: string
  inputClassName?: string
}

export function InputOTP({
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className,
  inputClassName,
}: InputOTPProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null)

  const digits = value.padEnd(OTP_LENGTH, ' ').split('').slice(0, OTP_LENGTH)

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return
    const newDigits = [...digits]
    newDigits[index] = digit.slice(-1)
    const newValue = newDigits.join('').replace(/\s/g, '')
    onChange(newValue)
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    if (newValue.length === OTP_LENGTH && onComplete) {
      onComplete(newValue)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then((text) => {
        const nums = text.replace(/\D/g, '').slice(0, OTP_LENGTH)
        if (nums.length > 0) {
          const newDigits = [...digits]
          for (let i = 0; i < nums.length; i++) {
            newDigits[i] = nums[i]
          }
          onChange(newDigits.join(''))
          const nextIndex = Math.min(nums.length, OTP_LENGTH - 1)
          inputRefs.current[nextIndex]?.focus()
          if (nums.length === OTP_LENGTH && onComplete) {
            onComplete(newDigits.join(''))
          }
        }
      }).catch(() => {})
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (text.length > 0) {
      const newDigits = [...digits]
      for (let i = 0; i < text.length; i++) {
        newDigits[i] = text[i]
      }
      onChange(newDigits.join(''))
      const nextIndex = Math.min(text.length, OTP_LENGTH - 1)
      inputRefs.current[nextIndex]?.focus()
      if (text.length === OTP_LENGTH && onComplete) {
        onComplete(newDigits.join(''))
      }
    }
  }

  return (
    <div
      className={cn('flex gap-2 justify-center', className)}
      onPaste={handlePaste}
    >
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoComplete="one-time-code"
          value={digits[i] === ' ' ? '' : digits[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={() => setFocusedIndex(i)}
          onBlur={() => setFocusedIndex(null)}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
          className={cn(
            'h-12 w-12 rounded-lg border-2 text-center text-lg font-semibold transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive animate-shake',
            focusedIndex === i && 'border-primary ring-2 ring-primary/20',
            !error && focusedIndex !== i && 'border-input hover:border-primary/50',
            inputClassName
          )}
        />
      ))}
    </div>
  )
}
