import type { Transaction } from '@/lib/api/types';

interface TransactionEditFormProps {
  transaction: Transaction;
}

export function TransactionEditForm({ transaction }: TransactionEditFormProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
        La edicion completa se habilitara en una siguiente fase. Esta vista confirma
        el punto de entrada de arquitectura para el modo editar.
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Agente de ventas</label>
          <input
            type="text"
            value={transaction.salesAgent || ''}
            readOnly
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Cliente</label>
          <input
            type="text"
            value={transaction.customerName || ''}
            readOnly
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">Notas</label>
        <textarea
          value={transaction.notes || ''}
          readOnly
          rows={3}
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
