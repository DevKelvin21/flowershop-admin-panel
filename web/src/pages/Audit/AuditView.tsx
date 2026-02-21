import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTable, type PaginationConfig } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Filters } from '@/components/Filters';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { AuditLog } from '@/lib/api/types';

interface AuditViewProps {
  data: AuditLog[];
  loading: boolean;
  error: string | null;
  pagination: PaginationConfig;
  filters: {
    userId: string;
    action: string;
    entityType: string;
    actionOptions: string[];
    entityTypeOptions: string[];
    onUserIdChange: (value: string) => void;
    onActionChange: (value: string) => void;
    onEntityTypeChange: (value: string) => void;
  };
}

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function extractDetail(changes: AuditLog['changes']): string {
  if (!changes) return '-';

  const message = changes.message;
  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  const serialized = JSON.stringify(changes);
  if (!serialized) return '-';
  return serialized.length > 120 ? `${serialized.slice(0, 120)}...` : serialized;
}

function buildColumns(): ColumnDef<AuditLog>[] {
  return [
    {
      accessorKey: 'timestamp',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha" />
      ),
      cell: ({ row }) => formatTimestamp(row.original.timestamp),
      sortingFn: (rowA, rowB) => {
        const a = new Date(rowA.original.timestamp).getTime();
        const b = new Date(rowB.original.timestamp).getTime();
        return a - b;
      },
    },
    {
      accessorKey: 'userId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Usuario" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.userId}</span>
      ),
    },
    {
      accessorKey: 'action',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Acción" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-[11px]">
          {row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: 'entityType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Entidad" />
      ),
      cell: ({ row }) => row.original.entityType,
    },
    {
      accessorKey: 'entityId',
      header: 'ID entidad',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.entityId || '-'}
        </span>
      ),
    },
    {
      id: 'detail',
      header: 'Detalle',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground" title={extractDetail(row.original.changes)}>
          {extractDetail(row.original.changes)}
        </span>
      ),
    },
  ];
}

export function AuditView({
  data,
  loading,
  error,
  pagination,
  filters,
}: AuditViewProps) {
  const columns = useMemo(() => buildColumns(), []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
        <h2 className="font-serif text-2xl text-primary">Bitácora</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Registro de operaciones del sistema con usuario, acción y contexto.
        </p>
      </div>

      <Filters
        search={{
          value: filters.userId,
          onChange: filters.onUserIdChange,
          placeholder: 'Filtrar por usuario (email exacto)',
        }}
        selects={[
          {
            key: 'action',
            value: filters.action,
            onChange: filters.onActionChange,
            options: [
              { value: 'all', label: 'Todas las acciones' },
              ...filters.actionOptions.map((value) => ({ value, label: value })),
            ],
          },
          {
            key: 'entityType',
            value: filters.entityType,
            onChange: filters.onEntityTypeChange,
            options: [
              { value: 'all', label: 'Todas las entidades' },
              ...filters.entityTypeOptions.map((value) => ({ value, label: value })),
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={data}
        pagination={pagination}
        emptyMessage="No hay registros de auditoría para este filtro"
      />
    </div>
  );
}
