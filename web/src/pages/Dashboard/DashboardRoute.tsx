import { useMemo, useState } from 'react';
import { useTransactionList, useTransactionSummary } from '@/hooks/queries/transactions';
import type { PaymentMethod, TransactionType } from '@/lib/api/types';
import { DashboardView } from './DashboardView';

type DashboardPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangeDisplay {
  from: string;
  to: string;
}

interface ResolvedDateRange {
  query: DateRange;
  display: DateRangeDisplay;
}

interface CustomDateRange {
  from?: string;
  to?: string;
}

interface DailyFlowPoint {
  date: string;
  label: string;
  sales: number;
  expenses: number;
}

const CENTRAL_TIME_ZONE = 'America/Chicago';

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: 'Hoy',
  week: 'Últimos 7 días',
  month: 'Últimos 30 días',
  year: 'Últimos 12 meses',
  custom: 'Rango personalizado',
};

function getDateString(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CENTRAL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function parseDateInput(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getPresetDateRange(period: Exclude<DashboardPeriod, 'custom'>): ResolvedDateRange {
  const today = new Date();
  const endExclusive = addDays(today, 1);

  const lookbackDays: Record<Exclude<DashboardPeriod, 'custom'>, number> = {
    today: 0,
    week: 6,
    month: 29,
    year: 364,
  };

  const startDate = addDays(today, -lookbackDays[period]);

  return {
    query: {
      startDate: getDateString(startDate),
      endDate: getDateString(endExclusive),
    },
    display: {
      from: getDateString(startDate),
      to: getDateString(today),
    },
  };
}

function getCustomDateRange(customRange: CustomDateRange): ResolvedDateRange {
  const today = new Date();

  const rawFrom = parseDateInput(customRange.from) ?? today;
  const rawTo = parseDateInput(customRange.to) ?? rawFrom;

  const fromDate = rawFrom <= rawTo ? rawFrom : rawTo;
  const toDate = rawFrom <= rawTo ? rawTo : rawFrom;

  return {
    query: {
      startDate: getDateString(fromDate),
      endDate: getDateString(addDays(toDate, 1)),
    },
    display: {
      from: getDateString(fromDate),
      to: getDateString(toDate),
    },
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShortDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('es-CO', {
    month: 'short',
    day: 'numeric',
    timeZone: CENTRAL_TIME_ZONE,
  }).format(date);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: CENTRAL_TIME_ZONE,
  }).format(date);
}

function resolvePaymentLabel(paymentMethod: PaymentMethod): string {
  return paymentMethod === 'BANK_TRANSFER' ? 'Transferencia' : 'Efectivo';
}

function resolveTransactionLabel(type: TransactionType): string {
  return type === 'SALE' ? 'Venta' : 'Gasto';
}

export function DashboardRoute() {
  const [period, setPeriod] = useState<DashboardPeriod>('month');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>(() => {
    const today = getDateString(new Date());
    return { from: today, to: today };
  });

  const resolvedRange = useMemo(
    () => (period === 'custom' ? getCustomDateRange(customDateRange) : getPresetDateRange(period)),
    [period, customDateRange],
  );

  const summaryQuery = useTransactionSummary({
    startDate: resolvedRange.query.startDate,
    endDate: resolvedRange.query.endDate,
  });

  const transactionsQuery = useTransactionList({
    page: 1,
    limit: 1000,
    startDate: resolvedRange.query.startDate,
    endDate: resolvedRange.query.endDate,
  });

  if (summaryQuery.error) throw summaryQuery.error;
  if (transactionsQuery.error) throw transactionsQuery.error;

  const transactions = useMemo(
    () => transactionsQuery.data?.data ?? [],
    [transactionsQuery.data?.data],
  );

  const summary = summaryQuery.data;
  const totalSales = summary?.totalSales ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const profit = summary?.profit ?? 0;
  const transactionCount = summary?.transactionCount ?? 0;
  const salesCount = summary?.salesCount ?? 0;
  const expensesCount = summary?.expensesCount ?? 0;
  const averageTicket = salesCount > 0 ? totalSales / salesCount : 0;
  const marginPercentage = totalSales > 0 ? (profit / totalSales) * 100 : 0;

  const metrics = [
    {
      label: 'Ingresos Netos',
      value: formatCurrency(profit),
      tone: profit >= 0 ? ('positive' as const) : ('negative' as const),
      caption: `Margen ${marginPercentage.toFixed(1)}%`,
    },
    {
      label: 'Total Ventas',
      value: formatCurrency(totalSales),
      tone: 'primary' as const,
      caption: `${salesCount} venta(s)`,
    },
    {
      label: 'Total Gastos',
      value: formatCurrency(totalExpenses),
      tone: 'negative' as const,
      caption: `${expensesCount} gasto(s)`,
    },
    {
      label: 'Ticket Promedio',
      value: formatCurrency(averageTicket),
      tone: 'neutral' as const,
      caption: `${transactionCount} transacciones`,
    },
  ];

  const dailyFlow: DailyFlowPoint[] = useMemo(() => {
    const byDay = transactions.reduce<Record<string, DailyFlowPoint>>((acc, transaction) => {
      const date = transaction.createdAt.split('T')[0];
      const current = acc[date] ?? {
        date,
        label: formatShortDate(date),
        sales: 0,
        expenses: 0,
      };

      if (transaction.type === 'SALE') {
        current.sales += transaction.totalAmount;
      } else {
        current.expenses += transaction.totalAmount;
      }

      acc[date] = current;
      return acc;
    }, {});

    return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  const salesByDay = useMemo(
    () =>
      dailyFlow.map((point) => ({
        date: point.date,
        label: point.label,
        total: point.sales,
      })),
    [dailyFlow],
  );

  const paymentBreakdown = useMemo(() => {
    const salesTransactions = transactions.filter((transaction) => transaction.type === 'SALE');
    const totalsByMethod = salesTransactions.reduce<Record<PaymentMethod, { total: number; count: number }>>(
      (acc, transaction) => {
        const method = transaction.paymentMethod;
        const current = acc[method] ?? { total: 0, count: 0 };
        current.total += transaction.totalAmount;
        current.count += 1;
        acc[method] = current;
        return acc;
      },
      {
        CASH: { total: 0, count: 0 },
        BANK_TRANSFER: { total: 0, count: 0 },
      },
    );

    const grandTotal = Object.values(totalsByMethod).reduce((sum, entry) => sum + entry.total, 0);

    return (Object.entries(totalsByMethod) as Array<[PaymentMethod, { total: number; count: number }]>)
      .map(([paymentMethod, values]) => ({
        paymentMethod,
        label: resolvePaymentLabel(paymentMethod),
        total: values.total,
        count: values.count,
        percentage: grandTotal > 0 ? (values.total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  const topItems = useMemo(() => {
    const aggregated = transactions.reduce<Record<string, { item: string; quantity: number; transactions: number }>>(
      (acc, transaction) => {
        if (transaction.type !== 'SALE') return acc;

        for (const item of transaction.items ?? []) {
          const itemName = item.inventory
            ? `${item.inventory.item} (${item.inventory.quality})`
            : 'Producto sin nombre';
          const current = acc[itemName] ?? { item: itemName, quantity: 0, transactions: 0 };
          current.quantity += item.quantity;
          current.transactions += 1;
          acc[itemName] = current;
        }

        return acc;
      },
      {},
    );

    return Object.values(aggregated)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [transactions]);

  const recentTransactions = useMemo(
    () =>
      transactions.slice(0, 6).map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        typeLabel: resolveTransactionLabel(transaction.type),
        totalAmount: transaction.totalAmount,
        paymentMethodLabel: resolvePaymentLabel(transaction.paymentMethod),
        createdAtLabel: formatDateTime(transaction.createdAt),
        salesAgent: transaction.salesAgent || 'Sin agente',
      })),
    [transactions],
  );

  return (
    <DashboardView
      period={period}
      periodLabel={PERIOD_LABELS[period]}
      dateRangeLabel={`${resolvedRange.display.from} → ${resolvedRange.display.to}`}
      customDateRange={customDateRange}
      onPeriodChange={(value) => setPeriod(value)}
      onCustomDateRangeChange={(value) => {
        setCustomDateRange(value);
        setPeriod('custom');
      }}
      metrics={metrics}
      salesByDay={salesByDay}
      dailyFlow={dailyFlow}
      paymentBreakdown={paymentBreakdown}
      topItems={topItems}
      recentTransactions={recentTransactions}
      formatCurrency={formatCurrency}
      isLoading={summaryQuery.isLoading || transactionsQuery.isLoading}
    />
  );
}
