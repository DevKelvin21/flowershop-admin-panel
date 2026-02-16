import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import type { InventoryItem } from '@/shared/models/inventory';
import { InventoryFormModal } from './inventory/InventoryFormModal';

interface AddInventoryLossPayload {
  inventoryId?: string;
  quantity: number;
  reason?: string;
  notes?: string;
}

interface AddInventoryLossModalProps {
  inventoryOptions: InventoryItem[];
  open: boolean;
  onCancel: () => void;
  onConfirm: (loss: AddInventoryLossPayload) => Promise<void> | void;
}

interface InventoryLossFormState {
  inventoryId: string;
  item: string;
  quality: string;
  quantity: number;
  reason: string;
  notes: string;
}

const ADD_LOSS_FORM_ID = 'add-inventory-loss-form';
const ADD_LOSS_TITLE_ID = 'add-inventory-loss-title';

const INITIAL_LOSS_FORM: InventoryLossFormState = {
  inventoryId: '',
  item: '',
  quality: '',
  quantity: 0,
  reason: 'loss',
  notes: '',
};

export function AddInventoryLossModal({
  inventoryOptions,
  open,
  onCancel,
  onConfirm,
}: AddInventoryLossModalProps) {
  const [newLoss, setNewLoss] = useState<InventoryLossFormState>(
    INITIAL_LOSS_FORM,
  );
  const [qualityFilter, setQualityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const qualityOptions = useMemo(() => {
    const uniqueQualities = new Set(
      inventoryOptions.map((item) => item.quality).filter(Boolean),
    );
    return Array.from(uniqueQualities).sort();
  }, [inventoryOptions]);

  const filteredInventoryOptions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return inventoryOptions.filter((item) => {
      if (!item.id) return false;
      if (qualityFilter !== 'all' && item.quality !== qualityFilter) return false;

      if (!normalizedSearch) return true;

      const itemText = `${item.item} ${item.quality}`.toLowerCase();
      return itemText.includes(normalizedSearch);
    });
  }, [inventoryOptions, qualityFilter, searchTerm]);

  useEffect(() => {
    if (!newLoss.inventoryId) return;

    const selectedStillVisible = filteredInventoryOptions.some(
      (item) => item.id === newLoss.inventoryId,
    );

    if (!selectedStillVisible) {
      setNewLoss((previous) => ({
        ...previous,
        inventoryId: '',
        item: '',
        quality: '',
      }));
    }
  }, [filteredInventoryOptions, newLoss.inventoryId]);

  const resetForm = () => {
    setNewLoss(INITIAL_LOSS_FORM);
    setQualityFilter('all');
    setSearchTerm('');
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleInventorySelection = (inventoryId: string) => {
    const selected = inventoryOptions.find((option) => option.id === inventoryId);

    setNewLoss((previous) => ({
      ...previous,
      inventoryId,
      item: selected?.item ?? '',
      quality: selected?.quality ?? '',
    }));
  };

  const handleSubmitInventoryLoss = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newLoss.inventoryId) {
      toast.error('Selecciona un articulo de inventario');
      return;
    }

    if (newLoss.quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    setIsSubmitting(true);

    try {
      await onConfirm({
        inventoryId: newLoss.inventoryId,
        quantity: newLoss.quantity,
        reason: newLoss.reason,
        notes: newLoss.notes || undefined,
      });
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InventoryFormModal.Frame open={open} titleId={ADD_LOSS_TITLE_ID}>
      <form id={ADD_LOSS_FORM_ID} onSubmit={handleSubmitInventoryLoss}>
        <InventoryFormModal.Header
          title="Registrar pérdida"
          description="Documenta mermas para mantener el inventario y reportes actualizados."
          titleId={ADD_LOSS_TITLE_ID}
        />

        <InventoryFormModal.Body>
          <InventoryFormModal.Field
            label="Filtrar por calidad"
            htmlFor="inventory-loss-quality-filter"
          >
            <select
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              id="inventory-loss-quality-filter"
              value={qualityFilter}
              onChange={(event) => setQualityFilter(event.target.value)}
            >
              <option value="all">Todas</option>
              {qualityOptions.map((quality) => (
                <option key={quality} value={quality}>
                  {quality}
                </option>
              ))}
            </select>
          </InventoryFormModal.Field>

          <InventoryFormModal.Field
            label="Buscar artículo"
            htmlFor="inventory-loss-search"
          >
            <Input
              id="inventory-loss-search"
              placeholder="Ej. rosa roja"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </InventoryFormModal.Field>

          <InventoryFormModal.Field
            label="Artículo de inventario"
            htmlFor="inventory-loss-item"
            hint={`${filteredInventoryOptions.length} resultados`}
          >
            <select
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              id="inventory-loss-item"
              value={newLoss.inventoryId}
              onChange={(event) => handleInventorySelection(event.target.value)}
            >
              <option value="">Selecciona artículo</option>
              {filteredInventoryOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item} ({item.quality})
                </option>
              ))}
              {filteredInventoryOptions.length === 0 ? (
                <option value="" disabled>
                  Sin resultados con los filtros actuales
                </option>
              ) : null}
            </select>
          </InventoryFormModal.Field>

          <InventoryFormModal.Field label="Cantidad" htmlFor="inventory-loss-quantity">
            <Input
              id="inventory-loss-quantity"
              min="1"
              placeholder="1"
              type="number"
              value={String(newLoss.quantity)}
              onChange={(event) =>
                setNewLoss((previous) => ({
                  ...previous,
                  quantity: Number(event.target.value),
                }))
              }
            />
          </InventoryFormModal.Field>

          <InventoryFormModal.Field
            label="Motivo"
            htmlFor="inventory-loss-reason"
            hint="Ejemplos: daño, expirado, marchitez, traslado."
          >
            <Input
              id="inventory-loss-reason"
              placeholder="Motivo de la pérdida"
              value={newLoss.reason}
              onChange={(event) =>
                setNewLoss((previous) => ({
                  ...previous,
                  reason: event.target.value,
                }))
              }
            />
          </InventoryFormModal.Field>

          <InventoryFormModal.Field
            label="Notas"
            htmlFor="inventory-loss-notes"
            hint="Opcional: agrega contexto para auditoría interna."
          >
            <textarea
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              id="inventory-loss-notes"
              placeholder="Detalles adicionales"
              value={newLoss.notes}
              onChange={(event) =>
                setNewLoss((previous) => ({
                  ...previous,
                  notes: event.target.value,
                }))
              }
            />
          </InventoryFormModal.Field>
        </InventoryFormModal.Body>

        <InventoryFormModal.Footer
          formId={ADD_LOSS_FORM_ID}
          onCancel={handleCancel}
          submitLabel="Registrar"
          isSubmitting={isSubmitting}
        />
      </form>
    </InventoryFormModal.Frame>
  );
}
