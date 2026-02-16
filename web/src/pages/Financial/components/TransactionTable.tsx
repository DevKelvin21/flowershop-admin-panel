import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type PaginationConfig } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { Transaction, TransactionItem } from '@/lib/api/types';
import { Trash2 } from 'lucide-react';
import { useTransactionModal } from './TransactionModal/useTransactionModal';

interface TransactionTableProps {
  transactions: Transaction[];
  pagination: PaginationConfig;
  onDelete: (t: Transaction) => void;
  formatCurrency: (amount: number) => string;
}

function formatItemsSummary(items?: TransactionItem[]): string {
  if (!items || items.length === 0) return '-';

  return items
    .map((item) => {
      const name = item.inventory?.item || 'Item';
      const quality = item.inventory?.quality;
      const label = quality ? `${name} (${quality})` : name;
      return `${item.quantity}x ${label}`;
    })
    .join(', ');
}

function createColumns(
  onDelete: (t: Transaction) => void,
  formatCurrency: (amount: number) => string
): ColumnDef<Transaction>[] {
  return [
    {
      accessorKey: "salesAgent",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vendedor" />
      ),
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("salesAgent") || '-'}</span>
      ),
    },
    {
      id: "items",
      header: "Artículos",
      cell: ({ row }) => {
        const items = row.original.items;
        const summary = formatItemsSummary(items);
        const itemCount = items?.length || 0;

        return (
          <div className="max-w-[250px]">
            <span className="text-sm text-muted-foreground line-clamp-2" title={summary}>
              {itemCount > 0 ? (
                <>
                  <Badge variant="outline" className="mr-2">
                    {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
                  </Badge>
                  <span className="text-xs">{summary}</span>
                </>
              ) : (
                '-'
              )}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "paymentMethod",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pago" />
      ),
      cell: ({ row }) => {
        const method = row.getValue("paymentMethod") as string;
        return (
          <Badge variant={method === 'BANK_TRANSFER' ? 'default' : 'secondary'}>
            {method === 'BANK_TRANSFER' ? 'Transfer' : 'Efectivo'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatCurrency(row.getValue("totalAmount"))}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return date.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.getValue("createdAt")).getTime();
        const dateB = new Date(rowB.getValue("createdAt")).getTime();
        return dateA - dateB;
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(transaction);
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Eliminar
          </Button>
        );
      },
    },
  ];
}

export function TransactionTable({
  transactions,
  pagination,
  onDelete,
  formatCurrency,
}: TransactionTableProps) {
  const { actions } = useTransactionModal();
  const columns = createColumns(onDelete, formatCurrency);

  return (
    <DataTable
      columns={columns}
      data={transactions}
      pagination={pagination}
      onRowClick={actions.openView}
      emptyMessage="No hay transacciones para mostrar"
    />
  );
}
