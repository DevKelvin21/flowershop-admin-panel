import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router';
import { inventoryListOptions } from '@/hooks/queries/inventory';
import {
  transactionListOptions,
  transactionSummaryOptions,
} from '@/hooks/queries/transactions';
import { getDefaultFinancialDateRange } from '@/pages/Financial/utils/dateRange';

const FinancialContainer = lazyRouteComponent(
  () => import('@/pages/Financial/FinancialContainer'),
  'FinancialContainer',
);

export const Route = createFileRoute('/_authenticated/financial')({
  loader: async ({ context }) => {
    const { today, tomorrow } = getDefaultFinancialDateRange();
    await Promise.allSettled([
      context.queryClient.ensureQueryData(
        transactionListOptions({
          type: 'SALE',
          startDate: today,
          endDate: tomorrow,
          page: 1,
          limit: 10,
        }),
      ),
      context.queryClient.ensureQueryData(
        transactionSummaryOptions({
          startDate: today,
          endDate: tomorrow,
        }),
      ),
      context.queryClient.ensureQueryData(inventoryListOptions()),
    ]);
  },
  component: FinancialContainer,
});
