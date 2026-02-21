import { useState } from 'react';
import { toast } from 'sonner';
import { useUpdateUserRole, useUsersList } from '@/hooks/queries/users';
import type { UserRole } from '@/lib/api/types';
import { UsersView } from './UsersView';

const DEFAULT_PAGE_SIZE = 20;

export function UsersContainer() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [email, setEmail] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const usersQuery = useUsersList({
    page: pageIndex + 1,
    limit: pageSize,
    email: email.trim() || undefined,
    role: roleFilter === 'all' ? undefined : (roleFilter as UserRole),
  });

  const updateRoleMutation = useUpdateUserRole();

  const handleRoleUpdate = async (id: string, role: UserRole) => {
    try {
      await updateRoleMutation.mutateAsync({ id, role });
      toast.success('Rol actualizado');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo actualizar el rol';
      toast.error(message);
    }
  };

  return (
    <UsersView
      loading={usersQuery.isLoading}
      error={usersQuery.error instanceof Error ? usersQuery.error.message : null}
      users={usersQuery.data?.data ?? []}
      pagination={{
        pageIndex: (usersQuery.data?.page ?? 1) - 1,
        pageSize: usersQuery.data?.limit ?? pageSize,
        pageCount: Math.max(
          1,
          Math.ceil(
            (usersQuery.data?.total ?? 0) /
              Math.max(1, usersQuery.data?.limit ?? pageSize),
          ),
        ),
        total: usersQuery.data?.total ?? 0,
        onPageChange: setPageIndex,
        onPageSizeChange: (nextPageSize) => {
          setPageIndex(0);
          setPageSize(nextPageSize);
        },
      }}
      filters={{
        email,
        role: roleFilter,
        onEmailChange: (value) => {
          setPageIndex(0);
          setEmail(value);
        },
        onRoleChange: (value) => {
          setPageIndex(0);
          setRoleFilter(value);
        },
      }}
      actions={{
        isUpdatingRole: updateRoleMutation.isPending,
        onRoleUpdate: handleRoleUpdate,
      }}
    />
  );
}
