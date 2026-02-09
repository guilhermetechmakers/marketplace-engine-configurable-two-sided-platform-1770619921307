import { apiGet } from '@/lib/api'
import type {
  AnalyticsReport,
  AnalyticsExportFormat,
  AnalyticsDateRange,
} from '@/types'

export interface FetchAnalyticsParams {
  dateRange?: AnalyticsDateRange
}

/** Fetch analytics report (GMV, funnel, listings performance, disputes, moderation) */
export function fetchAnalyticsReport(
  params?: FetchAnalyticsParams
): Promise<AnalyticsReport> {
  const search = new URLSearchParams()
  if (params?.dateRange) search.set('dateRange', params.dateRange)
  const query = search.toString()
  return apiGet<AnalyticsReport>(
    `/analytics/report${query ? `?${query}` : ''}`
  )
}

export interface ExportReportParams {
  dateRange?: AnalyticsDateRange
  reportType?: 'gmv' | 'conversion' | 'listings' | 'disputes' | 'moderation' | 'full'
}

/** Request export of analytics report; returns URL or blob identifier for download */
export function exportAnalyticsReport(
  format: AnalyticsExportFormat,
  params?: ExportReportParams
): Promise<{ downloadUrl: string } | { blob: string }> {
  const search = new URLSearchParams()
  search.set('format', format)
  if (params?.dateRange) search.set('dateRange', params.dateRange)
  if (params?.reportType) search.set('reportType', params.reportType)
  return apiGet<{ downloadUrl: string } | { blob: string }>(
    `/analytics/export?${search.toString()}`
  )
}
