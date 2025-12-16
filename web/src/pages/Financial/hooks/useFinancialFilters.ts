import { useState, useMemo, useCallback } from 'react';
import type { TransactionQueryParams } from '@/lib/api/types';

const CENTRAL_TIME_ZONE = 'America/Chicago';

function getDateString(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CENTRAL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date); // YYYY-MM-DD in CST/CDT
}

function getTodayAndTomorrow(): { today: string; tomorrow: string } {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    today: getDateString(today),
    tomorrow: getDateString(tomorrow),
  };
}

export function useFinancialFilters(activeTab: 'sales' | 'expenses' | 'summary') {
  const { today, tomorrow } = getTodayAndTomorrow();

  // Default: from today to tomorrow (API requires different dates)
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: today,
    to: tomorrow,
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const typeFilter = useMemo(() => {
    if (activeTab === 'sales') return 'SALE' as const;
    if (activeTab === 'expenses') return 'EXPENSE' as const;
    return undefined;
  }, [activeTab]);

  // Build query params for the API
  const queryParams = useMemo<TransactionQueryParams>(
    () => ({
      type: typeFilter,
      startDate: dateFilter.from || undefined,
      endDate: dateFilter.to || undefined,
      page: pagination.pageIndex + 1, // API uses 1-based pages
      limit: pagination.pageSize,
    }),
    [typeFilter, dateFilter, pagination]
  );

  // Reset pagination when filters change
  const handleDateChange = useCallback((next: { from?: string; to?: string }) => {
    setDateFilter({
      from: next.from ?? '',
      to: next.to ?? '',
    });
    // Reset to first page when date filter changes
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handlePageChange = useCallback((pageIndex: number) => {
    setPagination((prev) => ({ ...prev, pageIndex }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination({ pageIndex: 0, pageSize }); // Reset to first page when page size changes
  }, []);

  // Reset pagination when tab changes
  const resetPagination = useCallback(() => {
    setPagination({ pageIndex: 0, pageSize: 10 });
  }, []);

  return {
    dateFilter,
    setDateFilter: handleDateChange,
    queryParams,
    pagination,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    resetPagination,
  };
}
