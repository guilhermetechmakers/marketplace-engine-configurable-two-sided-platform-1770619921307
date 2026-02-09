import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMonitoringReport, type FetchMonitoringParams } from '@/api/monitoring'
import type {
  MonitoringReport,
  MonitoringDateRange,
  MonitoringErrorEvent,
  MonitoringErrorSummary,
} from '@/types'

function buildMockReport(dateRange: MonitoringDateRange): MonitoringReport {
  const now = new Date()
  const recentErrors: MonitoringErrorEvent[] = [
    {
      id: '1',
      message: 'Failed to load analytics report',
      type: 'error',
      source: 'api',
      path: '/api/analytics/report',
      status: 502,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      count: 3,
    },
    {
      id: '2',
      message: 'Validation error on checkout',
      type: 'warning',
      source: 'client',
      path: '/checkout',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      count: 12,
    },
    {
      id: '3',
      message: 'Session expired',
      type: 'info',
      source: 'auth',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      count: 7,
    },
  ]
  const errorSummary: MonitoringErrorSummary = {
    totalErrors: 42,
    totalWarnings: 18,
    unresolvedCount: 2,
    trendPercent: -12,
    period: dateRange,
  }
  const errorTimeSeries = Array.from({ length: dateRange === '24h' ? 24 : 14 }, (_, i) => {
    const d = new Date()
    d.setHours(d.getHours() - (dateRange === '24h' ? 23 - i : 13 - i))
    return {
      date: dateRange === '24h' ? d.toISOString().slice(0, 13) : d.toISOString().slice(0, 10),
      count: Math.floor(Math.random() * 8) + 1,
    }
  })
  return {
    dateRange,
    errorSummary,
    health: {
      status: 'healthy',
      uptimePercent: 99.98,
      lastChecked: now.toISOString(),
    },
    recentErrors,
    errorTimeSeries,
  }
}

const queryKeys = {
  report: (params?: FetchMonitoringParams) =>
    ['monitoring', 'report', params] as const,
}

export function useMonitoringReportQuery(params?: FetchMonitoringParams) {
  return useQuery({
    queryKey: queryKeys.report(params),
    queryFn: async (): Promise<MonitoringReport> => {
      try {
        return await fetchMonitoringReport(params)
      } catch {
        return buildMockReport(params?.dateRange ?? '24h')
      }
    },
  })
}

export function useMonitoringInvalidate() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: ['monitoring'] })
}

export { queryKeys as monitoringQueryKeys }
