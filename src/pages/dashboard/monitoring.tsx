import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  Info,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'
import { useMonitoringReportQuery } from '@/hooks/use-monitoring'
import { isSentryEnabled } from '@/lib/sentry'
import type {
  MonitoringReport,
  MonitoringDateRange,
  MonitoringErrorEvent,
} from '@/types'
import { cn } from '@/lib/utils'

const DATE_RANGE_OPTIONS: { value: MonitoringDateRange; label: string }[] = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
]

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportReportAsCsv(report: MonitoringReport): void {
  const rows: string[][] = [
    ['Metric', 'Value'],
    ['Date range', report.dateRange],
    ['Total errors', String(report.errorSummary.totalErrors)],
    ['Total warnings', String(report.errorSummary.totalWarnings)],
    ['Unresolved', String(report.errorSummary.unresolvedCount)],
    ['Trend %', String(report.errorSummary.trendPercent)],
    ['Health status', report.health?.status ?? '—'],
  ]
  report.recentErrors.forEach((e, i) => {
    if (i === 0) rows.push([])
    rows.push([
      e.type,
      e.message,
      e.source ?? '',
      e.path ?? '',
      String(e.status ?? ''),
      e.timestamp,
      String(e.count ?? 1),
    ])
  })
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(
    blob,
    `monitoring-report-${report.dateRange}-${new Date().toISOString().slice(0, 10)}.csv`
  )
}

function exportReportAsJson(report: MonitoringReport): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json;charset=utf-8;',
  })
  downloadBlob(
    blob,
    `monitoring-report-${report.dateRange}-${new Date().toISOString().slice(0, 10)}.json`
  )
}

export function DashboardMonitoring() {
  const queryClient = useQueryClient()
  const [dateRange, setDateRange] = useState<MonitoringDateRange>('24h')
  const { data, isLoading, isError, error } = useMonitoringReportQuery({
    dateRange,
  })

  const handleExport = (format: 'csv' | 'json') => {
    if (!data) {
      toast.error('No data to export')
      return
    }
    if (format === 'csv') {
      exportReportAsCsv(data)
      toast.success('Report exported as CSV')
      return
    }
    exportReportAsJson(data)
    toast.success('Report exported as JSON')
  }

  const errorColumns: ColumnDef<MonitoringErrorEvent>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => {
        const t = getValue() as string
        const Icon =
          t === 'error'
            ? AlertCircle
            : t === 'warning'
              ? AlertTriangle
              : Info
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
              t === 'error' && 'bg-destructive/10 text-destructive',
              t === 'warning' && 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
              t === 'info' && 'bg-muted text-muted-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {t}
          </span>
        )
      },
    },
    { accessorKey: 'message', header: 'Message', cell: ({ getValue }) => getValue() },
    { accessorKey: 'source', header: 'Source', cell: ({ getValue }) => getValue() ?? '—' },
    { accessorKey: 'path', header: 'Path', cell: ({ getValue }) => getValue() ?? '—' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => getValue() ?? '—',
    },
    {
      accessorKey: 'timestamp',
      header: 'Time',
      cell: ({ getValue }) => formatTime(getValue() as string),
    },
    {
      accessorKey: 'count',
      header: 'Count',
      cell: ({ getValue }) => getValue() ?? 1,
    },
  ]

  const table = useReactTable({
    data: data?.recentErrors ?? [],
    columns: errorColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="mb-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link
              to="/dashboard"
              className="hover:text-foreground hover:underline"
            >
              Dashboard
            </Link>
            <span className="mx-1">/</span>
            <span className="text-foreground">Monitoring & Error Tracking</span>
          </nav>
          <h1 className="text-2xl font-semibold tracking-tight">
            Monitoring & Error Tracking
          </h1>
          <p className="text-muted-foreground">
            Error tracking, health overview, and exportable reports. Integrates with
            Sentry and Datadog.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[160px] justify-between">
                {DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ??
                  dateRange}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuRadioGroup
                value={dateRange}
                onValueChange={(v) => setDateRange(v as MonitoringDateRange)}
              >
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <DropdownMenuRadioItem
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => handleExport('csv')}
            disabled={!data}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => handleExport('json')}
            disabled={!data}
          >
            <FileJson className="h-4 w-4" />
            Export JSON
          </Button>
          {isSentryEnabled && (
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a
                href="https://sentry.io"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Sentry dashboard"
              >
                <ExternalLink className="h-4 w-4" />
                Sentry
              </a>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card
              key={i}
              className="overflow-hidden transition-shadow hover:shadow-card-hover"
            >
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-8 w-20" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
            <p className="mb-2 text-muted-foreground">
              {(error as { message?: string })?.message ??
                'Failed to load monitoring data'}
            </p>
            <Button
              variant="outline"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ['monitoring'] })
              }
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="overflow-hidden border-l-4 border-l-primary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total errors
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {data.errorSummary.totalErrors}
                </p>
                <p
                  className={cn(
                    'text-xs',
                    data.errorSummary.trendPercent <= 0
                      ? 'text-green-600'
                      : 'text-destructive'
                  )}
                >
                  {data.errorSummary.trendPercent <= 0 ? '↓' : '↑'}{' '}
                  {Math.abs(data.errorSummary.trendPercent)}% vs previous period
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-l-4 border-l-amber-500 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Warnings
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {data.errorSummary.totalWarnings}
                </p>
                <p className="text-xs text-muted-foreground">In selected period</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-l-4 border-l-destructive transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unresolved
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {data.errorSummary.unresolvedCount}
                </p>
                <p className="text-xs text-muted-foreground">Needs attention</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Health
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold capitalize">
                  {data.health?.status ?? '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.health?.uptimePercent != null
                    ? `${data.health.uptimePercent}% uptime`
                    : '—'}
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Provider
                </CardTitle>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {isSentryEnabled ? 'Sentry' : '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isSentryEnabled
                    ? 'Error tracking active'
                    : 'Set VITE_SENTRY_DSN to enable'}
                </p>
              </CardContent>
            </Card>
          </div>

          {data.errorTimeSeries && data.errorTimeSeries.length > 0 && (
            <Card className="transition-shadow hover:shadow-card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Errors over time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.errorTimeSeries}>
                      <defs>
                        <linearGradient
                          id="errorGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="rgb(var(--destructive))"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor="rgb(var(--destructive))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="date"
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 'var(--radius)',
                          border: '1px solid hsl(var(--border))',
                        }}
                        formatter={([value]: [number]) => [
                          String(value),
                          'Errors',
                        ]}
                        labelFormatter={(label: string) => `Time: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="rgb(var(--destructive))"
                        fill="url(#errorGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Recent errors</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest error events in the selected period
              </p>
            </CardHeader>
            <CardContent>
              {data.recentErrors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Shield className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium">No errors in this period</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Error tracking will show events here when they occur.
                  </p>
                  {!isSentryEnabled && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Set VITE_SENTRY_DSN to connect Sentry for live error reporting.
                    </p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="transition-colors hover:bg-muted/50"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
