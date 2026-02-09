import * as Sentry from '@sentry/react'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

export const isSentryEnabled = Boolean(SENTRY_DSN && SENTRY_DSN.startsWith('https://'))

/**
 * Initialize Sentry when VITE_SENTRY_DSN is set.
 * Call once before app render (e.g. in main.tsx).
 */
export function initSentry(): void {
  if (!isSentryEnabled || !SENTRY_DSN) return
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE ?? 'development',
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    beforeSend(event) {
      if (import.meta.env.DEV) return event
      return event
    },
  })
}

/**
 * Report an error to Sentry (no-op if Sentry not enabled).
 */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (!isSentryEnabled) return
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => scope.setExtra(key, value))
    }
    if (error instanceof Error) {
      Sentry.captureException(error)
    } else {
      Sentry.captureMessage(String(error), 'error')
    }
  })
}

export { Sentry }
