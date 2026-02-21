import { Badge } from '@/components/ui/badge';
import type { PaymentMethod, Transaction } from '@/lib/api/types';

interface TransactionDetailViewProps {
  transaction: Transaction;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
  }).format(amount);
}

function formatPaymentMethod(method: PaymentMethod) {
  return method === 'BANK_TRANSFER' ? 'Transferencia' : 'Efectivo';
}

function formatTransactionType(type: Transaction['type']) {
  return type === 'SALE' ? 'Venta' : 'Gasto';
}

export function TransactionDetailView({ transaction }: TransactionDetailViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={transaction.type === 'SALE' ? 'default' : 'secondary'}>
          {formatTransactionType(transaction.type)}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {new Date(transaction.createdAt).toLocaleString('es-CO')}
        </span>
      </div>

      <div className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Agente de ventas</p>
          <p className="text-sm font-medium">{transaction.salesAgent || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Cliente</p>
          <p className="text-sm font-medium">{transaction.customerName || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Metodo de pago</p>
          <p className="text-sm font-medium">
            {formatPaymentMethod(transaction.paymentMethod)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-sm font-semibold">{formatCurrency(transaction.totalAmount)}</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Articulos</p>
        {transaction.type === 'EXPENSE' ? (
          <p className="text-sm text-muted-foreground">
            No aplica para gastos no ligados a inventario.
          </p>
        ) : transaction.items && transaction.items.length > 0 ? (
          <div className="space-y-2">
            {transaction.items.map((item) => {
              const itemLabel = item.inventory?.quality
                ? `${item.inventory?.item || 'Item'} (${item.inventory.quality})`
                : item.inventory?.item || 'Item';

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{itemLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(item.subtotal)}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin articulos registrados.</p>
        )}
      </div>

      {transaction.notes ? (
        <div className="rounded-md border border-border p-3">
          <p className="mb-1 text-xs text-muted-foreground">Notas</p>
          <p className="text-sm">{transaction.notes}</p>
        </div>
      ) : null}
    </div>
  );
}
