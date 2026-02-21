import { AiTransactionInput } from '@/components/ai/AiTransactionInput';
import { ParsedTransactionPreview } from '@/components/ai/ParsedTransactionPreview';
import { toast } from 'sonner';
import { useMemo } from 'react';
import type { PaymentMethod, TransactionType } from '@/lib/api/types';
import { useTransactionModal } from './useTransactionModal';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
  }).format(amount);
}

export function TransactionAddForm() {
  const { state, actions } = useTransactionModal();
  const { draft, aiResult, inventoryOptions } = state;
  const isSale = draft.type === 'SALE';

  const suggestedTotal = useMemo(() => {
    if (draft.items.length === 0) return 0;

    const inventoryById = new Map(
      inventoryOptions.map((item) => [item.id, item.unitPrice]),
    );

    return draft.items.reduce((sum, item) => {
      const unitPrice = inventoryById.get(item.inventoryId) ?? 0;
      const quantity = Number.isFinite(item.quantity) ? item.quantity : 0;
      return sum + unitPrice * quantity;
    }, 0);
  }, [draft.items, inventoryOptions]);

  return (
    <div className="space-y-4">
      {!aiResult && draft.type === 'SALE' && (
        <div className="mb-6 border-b border-border pb-6">
          <AiTransactionInput
            onParseSuccess={actions.applyAiResult}
            onParseError={(error) => {
              const message =
                error instanceof Error ? error.message : 'Error al procesar con IA';
              toast.error(message);
            }}
          />
        </div>
      )}

      {aiResult && (
        <div className="mb-6">
          <ParsedTransactionPreview
            result={aiResult}
            onAccept={actions.acceptAiResult}
            onReject={actions.rejectAiResult}
          />
        </div>
      )}

      {!aiResult && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Tipo</label>
            <select
              className="w-full rounded border border-border bg-background px-3 py-2"
              value={draft.type}
              onChange={(e) =>
                actions.updateDraft((prev) => ({
                  ...prev,
                  type: e.target.value as TransactionType,
                  items: e.target.value === 'EXPENSE' ? [] : prev.items,
                }))
              }
            >
              <option value="SALE">Venta</option>
              <option value="EXPENSE">Gasto</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Agente de Ventas</label>
            <input
              type="text"
              className="w-full rounded border border-border bg-background px-3 py-2"
              value={draft.salesAgent}
              onChange={(e) =>
                actions.updateDraft((prev) => ({
                  ...prev,
                  salesAgent: e.target.value,
                }))
              }
              placeholder="Nombre del vendedor"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Metodo de Pago</label>
            <select
              className="w-full rounded border border-border bg-background px-3 py-2"
              value={draft.paymentMethod}
              onChange={(e) =>
                actions.updateDraft((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value as PaymentMethod,
                }))
              }
            >
              <option value="CASH">Efectivo</option>
              <option value="BANK_TRANSFER">Transferencia</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Notas</label>
            <textarea
              className="w-full rounded border border-border bg-background px-3 py-2"
              value={draft.notes}
              onChange={(e) =>
                actions.updateDraft((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Notas adicionales"
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Total manual</label>
            <input
              type="number"
              className="w-full rounded border border-border bg-background px-3 py-2"
              value={draft.manualTotalAmount}
              onChange={(e) =>
                actions.updateDraft((prev) => ({
                  ...prev,
                  manualTotalAmount: e.target.value,
                }))
              }
              min={0}
              step="0.01"
              placeholder={isSale ? 'Opcional' : 'Obligatorio para gastos'}
            />
            {isSale ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Sugerido por inventario: {formatCurrency(suggestedTotal)}.
                Si lo dejas vacio, se usa el calculado automaticamente.
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Para gastos no ligados a inventario, ingresa el total pagado.
              </p>
            )}
          </div>

          {isSale ? (
            <div>
              <label className="mb-2 block text-sm font-medium">Articulos</label>
              {draft.items.map((item, idx) => (
                <div key={idx} className="mb-2 flex gap-2">
                  <select
                    className="flex-1 rounded border border-border bg-background px-3 py-2"
                    value={item.inventoryId}
                    onChange={(e) => {
                      const value = e.target.value;
                      actions.updateDraft((prev) => {
                        const nextItems = [...prev.items];
                        nextItems[idx] = { ...nextItems[idx], inventoryId: value };
                        return { ...prev, items: nextItems };
                      });
                    }}
                  >
                    <option value="">Seleccionar articulo</option>
                    {inventoryOptions.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.item} ({inv.quality}) - {inv.quantity} disponibles
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="w-20 rounded border border-border bg-background px-3 py-2"
                    value={item.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10) || 0;
                      actions.updateDraft((prev) => {
                        const nextItems = [...prev.items];
                        nextItems[idx] = { ...nextItems[idx], quantity: value };
                        return { ...prev, items: nextItems };
                      });
                    }}
                    min={1}
                    placeholder="Cant."
                  />
                  <button
                    type="button"
                    className="px-2 text-destructive hover:text-destructive/80"
                    onClick={() =>
                      actions.updateDraft((prev) => ({
                        ...prev,
                        items: prev.items.filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    x
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() =>
                  actions.updateDraft((prev) => ({
                    ...prev,
                    items: [...prev.items, { inventoryId: '', quantity: 1 }],
                  }))
                }
              >
                + Agregar articulo
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
