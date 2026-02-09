import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
  BarChart3,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Scale,
  Shield,
  ChevronDown,
  AlertCircle,
  FileSpreadsheet,
  FileJson,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAnalyticsReportQuery } from '@/hooks/use-analytics'
import type { AnalyticsFunnelStage, AnalyticsReport, AnalyticsDateRange, AnalyticsListingPerformance } from '@/types'
import { cn } from '@/lib/utils'

const DATE_RANGE_OPTIONS: { value: AnalyticsDateRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportReportAsCsv(report: AnalyticsReport): void {
  const rows: string[][] = [
    ['Metric', 'Value'],
    ['Date range', report.dateRange],
    ['GMV (total)', String(report.gmvSummary.gmvCents / 100)],
    ['Orders', String(report.gmvSummary.orderCount)],
    ['Disputes open', String(report.disputesSummary.open)],
    ['Disputes resolved', String(report.disputesSummary.resolved)],
    ['Moderation pending', String(report.moderationSummary.pendingReview)],
  ]
  report.listingsPerformance.forEach((row, i) => {
    if (i === 0) rows.push([])
    rows.push([row.title, `${row.views} views, ${row.conversions} conv, ${row.gmvCents / 100} ${row.currency}`])
  })
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `analytics-report-${report.dateRange}-${new Date().toISOString().slice(0, 10)}.csv`)
}

function exportReportAsJson(report: AnalyticsReport): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json;charset=utf-8;',
  })
  downloadBlob(blob, `analytics-report-${report.dateRange}-${new Date().toISOString().slice(0, 10)}.json`)
}

export function DashboardAnalytics() {
  const queryClient = useQueryClient()
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>('30d')
  const { data, isLoading, isError, error } = useAnalyticsReportQuery({ dateRange })
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

  const gmvChangePercent = data?.gmvSummary
    ? Math.round(
        ((data.gmvSummary.gmvCents - data.gmvSummary.gmvCentsPrevious) /
          (data.gmvSummary.gmvCentsPrevious || 1)) *
          100
      )
    : 0
  const orderChangePercent = data?.gmvSummary
    ? Math.round(
        ((data.gmvSummary.orderCount - data.gmvSummary.orderCountPrevious) /
          (data.gmvSummary.orderCountPrevious || 1)) *
          100
      )
    : 0

  const listingColumns = useMemo<ColumnDef<AnalyticsListingPerformance>[]>(
    () => [
      { accessorKey: 'title', header: 'Listing' },
      { accessorKey: 'views', header: 'Views', cell: ({ getValue }) => getValue() },
      { accessorKey: 'conversions', header: 'Conversions', cell: ({ getValue }) => getValue() },
      {
        accessorKey: 'conversionRate',
        header: 'Conv. rate',
        cell: ({ getValue }) => `${Number(getValue()).toFixed(1)}%`,
      },
      {
        accessorKey: 'gmvCents',
        header: 'GMV',
        cell: ({ row }) =>
          formatCurrency(row.original.gmvCents, row.original.currency),
      },
    ],
    []
  )

  const listingsTable = useReactTable({
    data: data?.listingsPerformance ?? [],
    columns: listingColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  const funnelColors = ['rgb(var(--primary))', 'rgb(var(--secondary))', 'rgb(var(--accent))', 'hsl(var(--muted-foreground))']

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics & Reporting</h1>
          <p className="text-muted-foreground">
            GMV, conversion funnels, listings performance, disputes, and moderation metrics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[160px] justify-between">
                {DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ?? dateRange}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuRadioGroup
                value={dateRange}
                onValueChange={(v) => setDateRange(v as AnalyticsDateRange)}
              >
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <DropdownMenuRadioItem key={opt.value} value={opt.value}>
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
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="overflow-hidden transition-shadow hover:shadow-card-hover">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-muted-foreground mb-2">
              {(error as { message?: string })?.message ?? 'Failed to load analytics'}
            </p>
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['analytics'] })}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          {/* Metric cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  GMV
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {formatCurrency(data.gmvSummary.gmvCents, data.gmvSummary.currency)}
                </p>
                <p
                  className={cn(
                    'text-xs',
                    gmvChangePercent >= 0 ? 'text-green-600' : 'text-destructive'
                  )}
                >
                  {gmvChangePercent >= 0 ? '↑' : '↓'} {Math.abs(gmvChangePercent)}% vs previous period
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 border-l-4 border-l-secondary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{data.gmvSummary.orderCount}</p>
                <p
                  className={cn(
                    'text-xs',
                    orderChangePercent >= 0 ? 'text-green-600' : 'text-destructive'
                  )}
                >
                  {orderChangePercent >= 0 ? '↑' : '↓'} {Math.abs(orderChangePercent)}% vs previous
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 border-l-4 border-l-accent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Conversion
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {data.conversionFunnel.length
                    ? formatPercent(
                        (data.conversionFunnel[data.conversionFunnel.length - 1]?.percentage ?? 0)
                      )
                    : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Funnel completion</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Disputes
                </CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {data.disputesSummary.open + data.disputesSummary.underReview} open
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.disputesSummary.resolved} resolved · {formatCurrency(data.disputesSummary.totalAmountCents, data.disputesSummary.currency)}
                </p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Moderation
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{data.moderationSummary.pendingReview} pending</p>
                <p className="text-xs text-muted-foreground">
                  {data.moderationSummary.approved} approved · {data.moderationSummary.avgResolutionHours}h avg
                </p>
              </CardContent>
            </Card>
          </div>

          {/* GMV over time */}
          <Card className="transition-shadow hover:shadow-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                GMV over time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.gmvTimeSeries}>
                    <defs>
                      <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v: number) => `$${v / 100}`} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 'var(--radius)',
                        border: '1px solid hsl(var(--border))',
                      }}
                      formatter={([value]: [number]) => [formatCurrency(value, data.gmvSummary.currency), 'GMV']}
                      labelFormatter={(label: string) => `Date: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="gmvCents"
                      stroke="rgb(var(--primary))"
                      fill="url(#gmvGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Conversion funnel */}
            <Card className="transition-shadow hover:shadow-card-hover">
              <CardHeader>
                <CardTitle>Conversion funnel</CardTitle>
              </CardHeader>
              <CardContent>
                {data.conversionFunnel.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <TrendingUp className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No funnel data for this period</p>
                  </div>
                ) : (
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.conversionFunnel}
                        layout="vertical"
                        margin={{ left: 80, right: 24 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis type="category" dataKey="name" width={72} className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 'var(--radius)',
                            border: '1px solid hsl(var(--border))',
                          }}
                          formatter={([value]: [number], _: unknown, props: { payload?: { percentage?: number } }) => [
                            `${value}${props.payload?.percentage != null ? ` (${props.payload.percentage.toFixed(1)}%)` : ''}`,
                            'Count',
                          ]}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {data.conversionFunnel.map((_: AnalyticsFunnelStage, i: number) => (
                            <Cell key={i} fill={funnelColors[i % funnelColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Listings performance */}
            <Card className="transition-shadow hover:shadow-card-hover">
              <CardHeader>
                <CardTitle>Listings performance</CardTitle>
              </CardHeader>
              <CardContent>
                {data.listingsPerformance.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart3 className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No listings data for this period</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        {listingsTable.getHeaderGroups().map((headerGroup) => (
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
                        {listingsTable.getRowModel().rows.map((row) => (
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
          </div>
        </>
      ) : null}
    </div>
  )
}
