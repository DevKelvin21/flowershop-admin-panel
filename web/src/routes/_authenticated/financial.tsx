import { createFileRoute } from '@tanstack/react-router';
import { inventoryListOptions } from '@/hooks/queries/inventory';
import {
  transactionListOptions,
  transactionSummaryOptions,
} from '@/hooks/queries/transactions';
import { FinancialContainer } from '@/pages/Financial/FinancialContainer';
import { getDefaultFinancialDateRange } from '@/pages/Financial/utils/dateRange';

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
