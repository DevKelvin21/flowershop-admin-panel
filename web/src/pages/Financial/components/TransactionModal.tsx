import { AiTransactionInput } from '@/components/ai/AiTransactionInput';
import { ParsedTransactionPreview } from '@/components/ai/ParsedTransactionPreview';
import type { PaymentMethod, ParseTransactionResponse, TransactionType } from '@/lib/api/types';
import type { TransactionDraft } from '../hooks/useAiTransaction';

interface TransactionModalProps {
  open: boolean;
  draft: TransactionDraft;
  aiResult: ParseTransactionResponse | null;
  inventoryOptions: { id: string; item: string; quality: string; quantity: number }[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onAiParseSuccess: (result: ParseTransactionResponse) => void;
  onAiParseError: (error: unknown) => void;
  onAiAccept: () => void;
  onAiReject: () => void;
  onUpdateDraft: (updater: (prev: TransactionDraft) => TransactionDraft) => void;
  onChangeType: (type: TransactionType) => void;
}

export function TransactionModal({
  open,
  draft,
  aiResult,
  inventoryOptions,
  isSubmitting,
  onClose,
  onSubmit,
  onAiParseSuccess,
  onAiParseError,
  onAiAccept,
  onAiReject,
  onUpdateDraft,
  onChangeType,
}: TransactionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-lg border border-border max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {draft.type === 'SALE' ? 'Nueva Venta' : 'Nuevo Gasto'}
        </h3>

        {/* AI Input Section */}
        {!aiResult && draft.type === 'SALE' && (
          <div className="mb-6 pb-6 border-b border-border">
            <AiTransactionInput
              onParseSuccess={onAiParseSuccess}
              onParseError={(error) => onAiParseError(error)}
            />
          </div>
        )}

        {/* AI Result Preview */}
        {aiResult && (
          <div className="mb-6">
            <ParsedTransactionPreview
              result={aiResult}
              onAccept={onAiAccept}
              onReject={onAiReject}
            />
          </div>
        )}

        {/* Manual Form - shown when no AI result or after accepting */}
        {!aiResult && (
          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                className="w-full border border-border rounded px-3 py-2 bg-background"
                value={draft.type}
                onChange={(e) => onChangeType(e.target.value as TransactionType)}
              >
                <option value="SALE">Venta</option>
                <option value="EXPENSE">Gasto</option>
              </select>
            </div>

            {/* Sales Agent */}
            <div>
              <label className="block text-sm font-medium mb-1">Agente de Ventas</label>
              <input
                type="text"
                className="w-full border border-border rounded px-3 py-2 bg-background"
                value={draft.salesAgent}
                onChange={(e) =>
                  onUpdateDraft((prev) => ({ ...prev, salesAgent: e.target.value }))
                }
                placeholder="Nombre del vendedor"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium mb-1">Metodo de Pago</label>
              <select
                className="w-full border border-border rounded px-3 py-2 bg-background"
                value={draft.paymentMethod}
                onChange={(e) =>
                  onUpdateDraft((prev) => ({
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
              <label className="block text-sm font-medium mb-1">Notas</label>
              <textarea
                className="w-full border border-border rounded px-3 py-2 bg-background"
                value={draft.notes}
                onChange={(e) =>
                  onUpdateDraft((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Notas adicionales"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Articulos</label>
              {draft.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <select
                    className="flex-1 border border-border rounded px-3 py-2 bg-background"
                    value={item.inventoryId}
                    onChange={(e) => {
                      const value = e.target.value;
                      onUpdateDraft((prev) => {
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
                    className="w-20 border border-border rounded px-3 py-2 bg-background"
                    value={item.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      onUpdateDraft((prev) => {
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
                      onUpdateDraft((prev) => ({
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
                  onUpdateDraft((prev) => ({
                    ...prev,
                    items: [...prev.items, { inventoryId: '', quantity: 1 }],
                  }))
                }
              >
                + Agregar articulo
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 border border-border rounded hover:bg-muted"
            onClick={onClose}
          >
            Cancelar
          </button>
          {!aiResult && (
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
