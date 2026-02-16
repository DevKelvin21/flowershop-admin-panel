import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import type { TransactionType } from '@/lib/api/types';
import { authService } from '@/services';
import { useState } from 'react';
import { TransactionModalProvider } from './components/TransactionModal';
import { FinancialView } from './FinancialView';
import { useFinancialData } from './hooks/useFinancialData';
import { useFinancialFilters } from './hooks/useFinancialFilters';

export function FinancialContainer() {
  useAuth(authService);
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses' | 'summary'>('sales');

  // Filters & Pagination
  const {
    dateFilter,
    setDateFilter,
    queryParams,
    pagination,
    onPageChange,
    onPageSizeChange,
    resetPagination,
  } = useFinancialFilters(activeTab);

  // Data
  const { transactions, summary, inventoryOptions, paginationInfo, isLoading, error } =
    useFinancialData(queryParams);

  const handleTabChange = (tab: 'sales' | 'expenses' | 'summary') => {
    setActiveTab(tab);
    resetPagination();
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) throw error;

  const defaultType: TransactionType =
    activeTab === 'sales' ? 'SALE' : 'EXPENSE';

  return (
    <TransactionModalProvider
      defaultType={defaultType}
      inventoryOptions={inventoryOptions}
    >
      <FinancialView
        tabs={{
          activeTab,
          onTabChange: handleTabChange,
        }}
        filters={{
          date: dateFilter,
          onDateChange: setDateFilter,
        }}
        transactions={transactions}
        pagination={{
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          pageCount: paginationInfo.pageCount,
          total: paginationInfo.total,
          onPageChange,
          onPageSizeChange,
        }}
        summary={{
          totalSales: new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
          }).format(summary?.totalSales || 0),
          totalExpenses: new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
          }).format(summary?.totalExpenses || 0),
          profit: new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
          }).format(summary?.profit || 0),
          transactionCount: summary?.transactionCount || 0,
        }}
      />
    </TransactionModalProvider>
  );
}
