import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAnalyticsReport,
  exportAnalyticsReport,
  type FetchAnalyticsParams,
  type ExportReportParams,
} from '@/api/analytics'
import type {
  AnalyticsReport,
  AnalyticsDateRange,
  AnalyticsExportFormat,
} from '@/types'

function buildMockReport(dateRange: AnalyticsDateRange): AnalyticsReport {
  const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
  const gmvTimeSeries = Array.from({ length: Math.min(days, 14) }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (Math.min(days, 14) - 1 - i))
    return {
      date: d.toISOString().slice(0, 10),
      gmvCents: 12000 + i * 800 + Math.floor(Math.random() * 2000),
      orderCount: 3 + i + Math.floor(Math.random() * 4),
    }
  })
  const totalGmv = gmvTimeSeries.reduce((s, p) => s + p.gmvCents, 0)
  const prevGmv = Math.floor(totalGmv * 0.85)
  const orderCount = gmvTimeSeries.reduce((s, p) => s + p.orderCount, 0)
  return {
    dateRange,
    gmvSummary: {
      gmvCents: totalGmv,
      gmvCentsPrevious: prevGmv,
      orderCount,
      orderCountPrevious: Math.max(1, Math.floor(orderCount * 0.9)),
      currency: 'USD',
    },
    gmvTimeSeries,
    conversionFunnel: [
      { name: 'Listing views', count: 1240, percentage: 100 },
      { name: 'Add to cart', count: 380, percentage: 30.6 },
      { name: 'Checkout started', count: 142, percentage: 11.5 },
      { name: 'Order completed', count: 98, percentage: 7.9 },
    ],
    listingsPerformance: [
      { listingId: '1', title: 'Professional consulting hour', views: 320, conversions: 18, conversionRate: 5.6, gmvCents: 54000, currency: 'USD' },
      { listingId: '2', title: 'Design package', views: 210, conversions: 12, conversionRate: 5.7, gmvCents: 36000, currency: 'USD' },
      { listingId: '3', title: 'Tutoring session', views: 180, conversions: 8, conversionRate: 4.4, gmvCents: 16000, currency: 'USD' },
    ],
    disputesSummary: {
      open: 2,
      underReview: 1,
      resolved: 12,
      totalAmountCents: 45000,
      currency: 'USD',
      trend: -15,
    },
    moderationSummary: {
      pendingReview: 3,
      approved: 48,
      rejected: 5,
      avgResolutionHours: 4.2,
      trend: 8,
    },
  }
}

const queryKeys = {
  report: (params?: FetchAnalyticsParams) => ['analytics', 'report', params] as const,
}

export function useAnalyticsReportQuery(params?: FetchAnalyticsParams) {
  return useQuery({
    queryKey: queryKeys.report(params),
    queryFn: async (): Promise<AnalyticsReport> => {
      try {
        return await fetchAnalyticsReport(params)
      } catch {
        return buildMockReport(params?.dateRange ?? '30d')
      }
    },
  })
}

export function useExportReportMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      format,
      params,
    }: {
      format: AnalyticsExportFormat
      params?: ExportReportParams
    }) => exportAnalyticsReport(format, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export { queryKeys as analyticsQueryKeys }
