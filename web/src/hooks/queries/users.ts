import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import type { UsersQueryParams, UserRole } from '@/lib/api/types';
import { normalizeQueryParams } from './query-key-utils';

const USERS_ME_STALE_TIME_MS = 60 * 1000;
const USERS_LIST_STALE_TIME_MS = 30 * 1000;

export const usersKeys = {
  all: ['users'] as const,
  me: () => [...usersKeys.all, 'me'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params?: UsersQueryParams) =>
    [...usersKeys.lists(), normalizeQueryParams(params)] as const,
};

export const usersMeOptions = () =>
  queryOptions({
    queryKey: usersKeys.me(),
    queryFn: () => usersApi.me(),
    staleTime: USERS_ME_STALE_TIME_MS,
  });

export const usersListOptions = (params?: UsersQueryParams) =>
  queryOptions({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.list(params),
    staleTime: USERS_LIST_STALE_TIME_MS,
  });

export function useUsersMe(enabled = true) {
  return useQuery({
    ...usersMeOptions(),
    enabled,
  });
}

export function useUsersList(params?: UsersQueryParams, enabled = true) {
  return useQuery({
    ...usersListOptions(params),
    enabled,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersApi.updateRole(id, role),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.me() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
      ]);
    },
  });
}
