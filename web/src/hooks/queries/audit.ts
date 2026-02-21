import { queryOptions, useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';
import type { AuditQueryParams } from '@/lib/api/types';
import { normalizeQueryParams } from './query-key-utils';

const AUDIT_LIST_STALE_TIME_MS = 30 * 1000;

export const auditKeys = {
  all: ['audit'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: (params?: AuditQueryParams) =>
    [...auditKeys.lists(), normalizeQueryParams(params)] as const,
};

export const auditListOptions = (params?: AuditQueryParams) =>
  queryOptions({
    queryKey: auditKeys.list(params),
    queryFn: () => auditApi.list(params),
    staleTime: AUDIT_LIST_STALE_TIME_MS,
  });

export function useAuditList(params?: AuditQueryParams) {
  return useQuery(auditListOptions(params));
}
