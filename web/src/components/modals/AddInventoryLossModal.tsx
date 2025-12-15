import { useState } from 'react';
import { toast } from 'sonner';
import type { InventoryItem, InventoryLoss } from '../../shared/models/inventory';

interface AddInventoryLossModalProps {
  inventoryOptions: InventoryItem[];
  open: boolean;
  onCancel: () => void;
  onConfirm: (loss: { inventoryId?: string; quantity: number; reason?: string; notes?: string }) => void;
}

export const AddInventoryLossModal = ({ inventoryOptions, open, onCancel, onConfirm }: AddInventoryLossModalProps) => {
  const [newLoss, setNewLoss] = useState<InventoryLoss>({
    inventoryId: '',
    item: '',
    quality: '',
    quantity: 0,
    reason: 'loss',
    timestamp: new Date().toISOString(),
  });

  const handleSubmitInventoryLoss = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newLoss.inventoryId) {
      toast.error('Selecciona un articulo de inventario');
      return;
    }
    if (newLoss.quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }
    await onConfirm({
      inventoryId: newLoss.inventoryId,
      quantity: newLoss.quantity,
      reason: newLoss.reason,
      notes: newLoss.notes,
    });
    setNewLoss({
      inventoryId: '',
      item: '',
      quality: '',
      quantity: 0,
      reason: 'loss',
      timestamp: new Date().toISOString(),
    });
  };

  const handleCancel = () => {
    onCancel();
    setNewLoss({
      inventoryId: '',
      item: '',
      quality: '',
      quantity: 0,
      reason: 'loss',
      timestamp: new Date().toISOString(),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50 backdrop-blur-sm">
      <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
        <h3 className="text-lg font-semibold mb-4 text-primary">Registrar Pérdida</h3>
        <form
          onSubmit={handleSubmitInventoryLoss}
          className="flex flex-col gap-3"
        >
          <select
            className="border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            value={newLoss.inventoryId}
            onChange={(e) => {
              const selected = inventoryOptions.find((opt) => opt.id === e.target.value);
              setNewLoss((prev) => ({
                ...prev,
                inventoryId: e.target.value,
                item: selected?.item ?? '',
                quality: selected?.quality ?? '',
              }));
            }}
            required
          >
            <option value="">Selecciona artículo</option>
            {inventoryOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.item} ({item.quality})
              </option>
            ))}
          </select>
          <input
            className="border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            placeholder="Cantidad"
            type="number"
            min="1"
            value={newLoss.quantity.toString()}
            onChange={e => setNewLoss({ ...newLoss, quantity: Number(e.target.value) })}
            required
          />
          <input
            className="border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            placeholder="Motivo (ej. daño, expirado)"
            value={newLoss.reason ?? ''}
            onChange={e => setNewLoss({ ...newLoss, reason: e.target.value })}
          />
          <textarea
            className="border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            placeholder="Notas (opcional)"
            value={newLoss.notes ?? ''}
            onChange={e => setNewLoss({ ...newLoss, notes: e.target.value })}
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-muted hover:bg-muted/80 text-muted-foreground"
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
