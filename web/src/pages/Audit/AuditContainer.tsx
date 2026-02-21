import { useMemo, useState } from 'react';
import { useAuditList } from '@/hooks/queries/audit';
import { AuditView } from './AuditView';

const DEFAULT_PAGE_SIZE = 20;

export function AuditContainer() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('all');
  const [entityType, setEntityType] = useState('all');

  const query = useAuditList({
    page: pageIndex + 1,
    limit: pageSize,
    userId: userId.trim() || undefined,
    action: action === 'all' ? undefined : action,
    entityType: entityType === 'all' ? undefined : entityType,
  });

  const logs = useMemo(() => query.data?.data ?? [], [query.data?.data]);
  const total = query.data?.total ?? 0;
  const page = query.data?.page ?? pageIndex + 1;
  const limit = query.data?.limit ?? pageSize;
  const pageCount = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  const actionOptions = useMemo(
    () =>
      Array.from(new Set(logs.map((item) => item.action).filter(Boolean))).sort(),
    [logs],
  );
  const entityTypeOptions = useMemo(
    () =>
      Array.from(new Set(logs.map((item) => item.entityType).filter(Boolean))).sort(),
    [logs],
  );

  return (
    <AuditView
      data={logs}
      loading={query.isLoading}
      error={query.error instanceof Error ? query.error.message : null}
      pagination={{
        pageIndex: page - 1,
        pageSize: limit,
        pageCount,
        total,
        onPageChange: setPageIndex,
        onPageSizeChange: (nextPageSize) => {
          setPageIndex(0);
          setPageSize(nextPageSize);
        },
      }}
      filters={{
        userId,
        action,
        entityType,
        actionOptions,
        entityTypeOptions,
        onUserIdChange: (value) => {
          setPageIndex(0);
          setUserId(value);
        },
        onActionChange: (value) => {
          setPageIndex(0);
          setAction(value);
        },
        onEntityTypeChange: (value) => {
          setPageIndex(0);
          setEntityType(value);
        },
      }}
    />
  );
}
