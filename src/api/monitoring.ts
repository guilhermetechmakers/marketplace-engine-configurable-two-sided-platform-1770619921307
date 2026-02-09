import { apiGet } from '@/lib/api'
import type { MonitoringReport, MonitoringDateRange } from '@/types'

export interface FetchMonitoringParams {
  dateRange?: MonitoringDateRange
}

/** Fetch monitoring report (error summary, recent errors, health). */
export function fetchMonitoringReport(
  params?: FetchMonitoringParams
): Promise<MonitoringReport> {
  const search = new URLSearchParams()
  if (params?.dateRange) search.set('dateRange', params.dateRange)
  const query = search.toString()
  return apiGet<MonitoringReport>(
    `/monitoring/report${query ? `?${query}` : ''}`
  )
}
