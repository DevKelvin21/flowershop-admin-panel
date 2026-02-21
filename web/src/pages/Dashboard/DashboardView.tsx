import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownRight, ArrowUpRight, Banknote, CalendarDays, Package, ReceiptText, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type DashboardPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';
type DashboardMetricTone = 'primary' | 'positive' | 'negative' | 'neutral';

interface DashboardMetric {
  label: string;
  value: string;
  tone: DashboardMetricTone;
  caption: string;
}

interface SalesPoint {
  date: string;
  total: number;
  label: string;
}

interface PaymentBreakdownItem {
  paymentMethod: 'CASH' | 'BANK_TRANSFER';
  label: string;
  total: number;
  count: number;
  percentage: number;
}

interface DailyFlowPoint {
  date: string;
  label: string;
  sales: number;
  expenses: number;
}

interface RecentTransaction {
  id: string;
  type: 'SALE' | 'EXPENSE';
  typeLabel: string;
  totalAmount: number;
  paymentMethodLabel: string;
  createdAtLabel: string;
  salesAgent: string;
}

interface TopProductItem {
  item: string;
  quantity: number;
  transactions: number;
}

interface DashboardViewProps {
  period: DashboardPeriod;
  periodLabel: string;
  dateRangeLabel: string;
  onPeriodChange: (value: DashboardPeriod) => void;
  customDateRange: {
    from?: string;
    to?: string;
  };
  onCustomDateRangeChange: (value: { from?: string; to?: string }) => void;
  metrics: DashboardMetric[];
  salesByDay: SalesPoint[];
  dailyFlow: DailyFlowPoint[];
  paymentBreakdown: PaymentBreakdownItem[];
  topItems: TopProductItem[];
  recentTransactions: RecentTransaction[];
  formatCurrency: (value: number) => string;
  isLoading: boolean;
}

const PAYMENT_CHART_COLORS = ['var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)'];

const compactCurrency = new Intl.NumberFormat('es-CO', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function parseDateInput(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateInput(date?: Date): string | undefined {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatRangeLabel(from?: string, to?: string): string {
  if (!from && !to) return 'Seleccionar rango';

  const formattedFrom = from
    ? new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(
        new Date(`${from}T00:00:00`),
      )
    : '...';
  const formattedTo = to
    ? new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(
        new Date(`${to}T00:00:00`),
      )
    : '...';

  return `${formattedFrom} - ${formattedTo}`;
}

function MetricCard({ metric }: { metric: DashboardMetric }) {
  const toneClass =
    metric.tone === 'positive'
      ? 'text-secondary'
      : metric.tone === 'negative'
        ? 'text-destructive'
        : metric.tone === 'primary'
          ? 'text-primary'
          : 'text-foreground';

  const toneIcon =
    metric.tone === 'positive' ? (
      <ArrowUpRight className="size-4 text-secondary" />
    ) : metric.tone === 'negative' ? (
      <ArrowDownRight className="size-4 text-destructive" />
    ) : metric.tone === 'primary' ? (
      <TrendingUp className="size-4 text-primary" />
    ) : (
      <Wallet className="size-4 text-muted-foreground" />
    );

  return (
    <article className="rounded-xl border border-border/70 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--card)_90%,var(--muted)_10%),var(--card))] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{metric.label}</p>
        {toneIcon}
      </div>
      <p className={`mt-3 text-3xl font-semibold ${toneClass}`}>{metric.value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{metric.caption}</p>
    </article>
  );
}

function SalesTrendChart({
  points,
  formatCurrency,
}: {
  points: SalesPoint[];
  formatCurrency: (value: number) => string;
}) {
  if (!points.length) {
    return <p className="text-sm text-muted-foreground">Sin datos de ventas en este período.</p>;
  }

  const values = points.map((point) => point.total);
  const max = Math.max(...values, 1);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-background/70 p-3">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={56}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickFormatter={(value: number) => compactCurrency.format(value)}
              />
              <Tooltip
                cursor={{ stroke: 'var(--border)', strokeOpacity: 0.4 }}
                contentStyle={{
                  borderRadius: 10,
                  borderColor: 'var(--border)',
                  background: 'var(--background)',
                }}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#salesAreaGradient)"
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div>
          <p className="font-medium text-foreground">{formatCurrency(values[0] || 0)}</p>
          <p>{points[0]?.label}</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">{formatCurrency(max)}</p>
          <p>Pico del período</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-foreground">{formatCurrency(values[values.length - 1] || 0)}</p>
          <p>{points[points.length - 1]?.label}</p>
        </div>
      </div>
    </div>
  );
}

function SalesVsExpensesChart({
  data,
  formatCurrency,
}: {
  data: DailyFlowPoint[];
  formatCurrency: (value: number) => string;
}) {
  if (!data.length) {
    return <p className="text-sm text-muted-foreground">No hay datos para comparar ventas y gastos.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="h-56 rounded-xl border border-border/60 bg-background/70 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickFormatter={(value: number) => compactCurrency.format(value)}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                borderColor: 'var(--border)',
                background: 'var(--background)',
              }}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="sales" name="Ventas" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Gastos" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Comparación diaria del flujo operativo para detectar días con mayor presión de costos.
      </p>
    </div>
  );
}

function PaymentBreakdown({
  data,
  formatCurrency,
}: {
  data: PaymentBreakdownItem[];
  formatCurrency: (value: number) => string;
}) {
  if (!data.length || data.every((item) => item.total === 0)) {
    return <p className="text-sm text-muted-foreground">No hay ventas para calcular métodos de pago.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="h-52 rounded-xl border border-border/60 bg-background/70 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="label"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={3}
              stroke="var(--background)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.paymentMethod} fill={PAYMENT_CHART_COLORS[index % PAYMENT_CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                borderColor: 'var(--border)',
                background: 'var(--background)',
              }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {data.map((item, index) => (
        <div key={item.paymentMethod} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: PAYMENT_CHART_COLORS[index % PAYMENT_CHART_COLORS.length] }}
              />
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-muted-foreground">({item.count})</span>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">{formatCurrency(item.total)}</p>
              <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted/70">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${Math.max(4, item.percentage)}%`,
                backgroundColor: PAYMENT_CHART_COLORS[index % PAYMENT_CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TopProducts({
  items,
}: {
  items: TopProductItem[];
}) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Todavía no hay productos vendidos en el período.</p>;
  }
  const chartData = items.slice(0, 8).map((item) => ({
    ...item,
    shortLabel: item.item.length > 24 ? `${item.item.slice(0, 24)}...` : item.item,
  }));

  return (
    <div className="space-y-4">
      <div className="h-60 rounded-xl border border-border/60 bg-background/70 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 12, left: 12, bottom: 18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
            <XAxis
              dataKey="shortLabel"
              interval={0}
              angle={-28}
              height={54}
              textAnchor="end"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickFormatter={(value: number) => compactCurrency.format(value)}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                borderColor: 'var(--border)',
                background: 'var(--background)',
              }}
              formatter={(value) => `${Number(value)} uds`}
              labelFormatter={(value, payload) => payload?.[0]?.payload?.item || value}
            />
            <Bar dataKey="quantity" name="Unidades" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {chartData.slice(0, 4).map((item) => (
          <div key={item.item} className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate pr-3">{item.item}</span>
            <span className="whitespace-nowrap">{item.quantity} uds · {item.transactions} venta(s)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentTransactions({
  transactions,
  formatCurrency,
}: {
  transactions: RecentTransaction[];
  formatCurrency: (value: number) => string;
}) {
  if (!transactions.length) {
    return <p className="text-sm text-muted-foreground">No hay transacciones recientes en el período.</p>;
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <article
          key={transaction.id}
          className="rounded-lg border border-border/60 bg-background/60 p-3 transition-colors hover:bg-background"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={transaction.type === 'SALE' ? 'default' : 'outline'}>
                  {transaction.typeLabel}
                </Badge>
                <span className="text-xs text-muted-foreground">{transaction.paymentMethodLabel}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{transaction.createdAtLabel}</p>
              <p className="text-sm text-muted-foreground">Agente: {transaction.salesAgent}</p>
            </div>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(transaction.totalAmount)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function DashboardView({
  period,
  periodLabel,
  dateRangeLabel,
  onPeriodChange,
  customDateRange,
  onCustomDateRangeChange,
  metrics,
  salesByDay,
  dailyFlow,
  paymentBreakdown,
  topItems,
  recentTransactions,
  formatCurrency,
  isLoading,
}: DashboardViewProps) {
  const [customRangeOpen, setCustomRangeOpen] = useState(false);

  const selectedDateRange = useMemo<DateRange | undefined>(() => {
    const from = parseDateInput(customDateRange.from);
    const to = parseDateInput(customDateRange.to);
    if (!from && !to) return undefined;
    return { from, to };
  }, [customDateRange.from, customDateRange.to]);

  useEffect(() => {
    if (period === 'custom') {
      setCustomRangeOpen(true);
    }
  }, [period]);

  return (
    <div className="space-y-5">
      <header className="rounded-xl border border-border/70 bg-[linear-gradient(140deg,color-mix(in_oklch,var(--card)_75%,var(--accent)_25%),color-mix(in_oklch,var(--card)_90%,var(--background)_10%))] p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-primary md:text-3xl">Reporte Ejecutivo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Vista general del negocio con ventas, gastos y desempeño del inventario.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Badge variant="secondary" className="w-fit gap-1.5 px-2.5 py-1">
              <ReceiptText className="size-3.5" />
              {periodLabel}
            </Badge>
            <Select value={period} onValueChange={(value) => onPeriodChange(value as DashboardPeriod)}>
              <SelectTrigger className="w-[180px] bg-background/85">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Últimos 7 días</SelectItem>
                <SelectItem value="month">Últimos 30 días</SelectItem>
                <SelectItem value="year">Últimos 12 meses</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            {period === 'custom' && (
              <Popover open={customRangeOpen} onOpenChange={setCustomRangeOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="min-w-[220px] justify-start gap-2 bg-background/85">
                    <CalendarDays className="size-4" />
                    <span className="truncate">{formatRangeLabel(customDateRange.from, customDateRange.to)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={selectedDateRange}
                    onSelect={(next) => {
                      onCustomDateRangeChange({
                        from: formatDateInput(next?.from),
                        to: formatDateInput(next?.to ?? next?.from),
                      });
                    }}
                    numberOfMonths={1}
                    defaultMonth={selectedDateRange?.from ?? selectedDateRange?.to}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">{dateRangeLabel}</p>
      </header>

      {isLoading ? (
        <section className="rounded-xl border border-border/70 bg-card/70 p-6 text-center text-muted-foreground">
          Cargando métricas y tendencias...
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <article className="rounded-xl border border-border/70 bg-card/70 p-5 shadow-sm xl:col-span-3">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                <h3 className="font-medium text-foreground">Tendencia de Ventas</h3>
              </div>
              <SalesTrendChart points={salesByDay} formatCurrency={formatCurrency} />
            </article>

            <article className="rounded-xl border border-border/70 bg-card/70 p-5 shadow-sm xl:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <Banknote className="size-4 text-primary" />
                <h3 className="font-medium text-foreground">Ventas por Método de Pago</h3>
              </div>
              <PaymentBreakdown data={paymentBreakdown} formatCurrency={formatCurrency} />
            </article>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <article className="rounded-xl border border-border/70 bg-card/70 p-5 shadow-sm xl:col-span-3">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                <h3 className="font-medium text-foreground">Ventas vs Gastos</h3>
              </div>
              <SalesVsExpensesChart data={dailyFlow} formatCurrency={formatCurrency} />
            </article>

            <article className="rounded-xl border border-border/70 bg-card/70 p-5 shadow-sm xl:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <Package className="size-4 text-primary" />
                <h3 className="font-medium text-foreground">Productos Más Vendidos</h3>
              </div>
              <TopProducts items={topItems} />
            </article>

            <article className="rounded-xl border border-border/70 bg-card/70 p-5 shadow-sm xl:col-span-5">
              <div className="mb-4 flex items-center gap-2">
                <Wallet className="size-4 text-primary" />
                <h3 className="font-medium text-foreground">Actividad Reciente</h3>
              </div>
              <RecentTransactions transactions={recentTransactions} formatCurrency={formatCurrency} />
            </article>
          </section>
        </>
      )}
    </div>
  );
}
