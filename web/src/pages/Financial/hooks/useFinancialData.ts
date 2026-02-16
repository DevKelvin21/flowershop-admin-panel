import { useMemo } from 'react';
import {
  useTransactionList,
  useTransactionSummary,
} from '@/hooks/queries/transactions';
import { useInventoryList } from '@/hooks/queries/inventory';
import type { TransactionQueryParams } from '@/lib/api/types';

export function useFinancialData(params: TransactionQueryParams) {
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useTransactionList(params);

  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useTransactionSummary({
    startDate: params.startDate,
    endDate: params.endDate,
  });

  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    error: inventoryError,
  } = useInventoryList();

  const inventoryOptions = useMemo(
    () =>
      inventoryData?.data?.map((item) => ({
        id: item.id,
        item: item.item,
        quality: item.quality,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })) ?? [],
    [inventoryData]
  );

  // Pagination info from API response
  const paginationInfo = useMemo(
    () => ({
      total: transactionsData?.total ?? 0,
      page: transactionsData?.page ?? 1,
      limit: transactionsData?.limit ?? 10,
      pageCount: Math.ceil((transactionsData?.total ?? 0) / (transactionsData?.limit ?? 10)) || 1,
    }),
    [transactionsData]
  );

  return {
    transactions: transactionsData?.data ?? [],
    summary: summaryData,
    inventoryOptions,
    paginationInfo,
    isLoading: transactionsLoading || summaryLoading || inventoryLoading,
    error: transactionsError || summaryError || inventoryError,
  };
}
