import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable, type PaginationConfig } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Filters } from '@/components/Filters';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AppUser, UserRole } from '@/lib/api/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

interface UsersViewProps {
  loading: boolean;
  error: string | null;
  users: AppUser[];
  pagination: PaginationConfig;
  filters: {
    email: string;
    role: string;
    onEmailChange: (value: string) => void;
    onRoleChange: (value: string) => void;
  };
  actions: {
    isUpdatingRole: boolean;
    onRoleUpdate: (id: string, role: UserRole) => void;
  };
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function buildColumns(
  isUpdatingRole: boolean,
  onRoleUpdate: (id: string, role: UserRole) => void,
): ColumnDef<AppUser>[] {
  return [
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'displayName',
      header: 'Nombre',
      cell: ({ row }) => row.original.displayName || '-',
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rol" />
      ),
      cell: ({ row }) => (
        <Select
          value={row.original.role}
          onValueChange={(value) => onRoleUpdate(row.original.id, value as UserRole)}
          disabled={isUpdatingRole}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OWNER">OWNER</SelectItem>
            <SelectItem value="STAFF">STAFF</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actualizado" />
      ),
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
  ];
}

export function UsersView({
  loading,
  error,
  users,
  pagination,
  filters,
  actions,
}: UsersViewProps) {
  const columns = useMemo(
    () => buildColumns(actions.isUpdatingRole, actions.onRoleUpdate),
    [actions.isUpdatingRole, actions.onRoleUpdate],
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
        <h2 className="font-serif text-2xl text-primary">Usuarios</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestión de roles y acceso del panel administrativo.
        </p>
      </div>

      <Filters
        search={{
          value: filters.email,
          onChange: filters.onEmailChange,
          placeholder: 'Buscar por email...',
        }}
        selects={[
          {
            key: 'role',
            value: filters.role,
            onChange: filters.onRoleChange,
            options: [
              { value: 'all', label: 'Todos los roles' },
              { value: 'OWNER', label: 'OWNER' },
              { value: 'STAFF', label: 'STAFF' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={users}
        pagination={pagination}
        emptyMessage="No hay usuarios registrados para este filtro"
      />
    </div>
  );
}
