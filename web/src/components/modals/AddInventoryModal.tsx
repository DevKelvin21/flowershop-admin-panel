import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { INVENTORY_QUALITIES } from '@/shared/constants/inventory';
import type { NewInventoryItem } from '@/shared/models/inventory';
import { InventoryFormModal } from './inventory/InventoryFormModal';

interface AddInventoryModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (item: NewInventoryItem) => Promise<void> | void;
}

type AddInventoryFormState = Omit<NewInventoryItem, 'unitPrice'>;

const ADD_INVENTORY_FORM_ID = 'add-inventory-form';
const ADD_INVENTORY_TITLE_ID = 'add-inventory-title';

const INITIAL_FORM_DATA: AddInventoryFormState = {
  item: '',
  quantity: 0,
  quality: '',
};

export function AddInventoryModal({
  open,
  onCancel,
  onConfirm,
}: AddInventoryModalProps) {
  const [formData, setFormData] = useState<AddInventoryFormState>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.item.trim()) {
      toast.error('El nombre del articulo es requerido');
      return;
    }

    if (!formData.quality) {
      toast.error('Selecciona una calidad');
      return;
    }

    setIsSubmitting(true);

    try {
      await onConfirm({ ...formData, unitPrice: 0 });
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InventoryFormModal.Frame open={open} titleId={ADD_INVENTORY_TITLE_ID}>
      <form id={ADD_INVENTORY_FORM_ID} onSubmit={handleSubmit}>
        <InventoryFormModal.Header
          title="Agregar nuevo artículo"
          description="Registra un artículo disponible para las próximas ventas. El precio unitario queda en 0 por defecto."
          titleId={ADD_INVENTORY_TITLE_ID}
        />

        <InventoryFormModal.Body>
          <InventoryFormModal.Field
            label="Nombre del artículo"
            htmlFor="inventory-item-name"
          >
            <Input
              autoFocus
              id="inventory-item-name"
              placeholder="Ej. Rosa roja"
              value={formData.item}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, item: event.target.value }))
              }
            />
          </InventoryFormModal.Field>

          <InventoryFormModal.Field label="Cantidad" htmlFor="inventory-item-quantity">
            <Input
              id="inventory-item-quantity"
              min="0"
              placeholder="0"
              type="number"
              value={String(formData.quantity)}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  quantity: Number(event.target.value),
                }))
              }
            />
          </InventoryFormModal.Field>

          <InventoryFormModal.Field label="Calidad" htmlFor="inventory-item-quality">
            <select
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              id="inventory-item-quality"
              value={formData.quality}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, quality: event.target.value }))
              }
            >
              <option value="">Selecciona calidad</option>
              <option value={INVENTORY_QUALITIES.SPECIAL}>Especial</option>
              <option value={INVENTORY_QUALITIES.REGULAR}>Regular</option>
            </select>
          </InventoryFormModal.Field>

        </InventoryFormModal.Body>

        <InventoryFormModal.Footer
          formId={ADD_INVENTORY_FORM_ID}
          onCancel={handleCancel}
          submitLabel="Agregar"
          isSubmitting={isSubmitting}
        />
      </form>
    </InventoryFormModal.Frame>
  );
}
