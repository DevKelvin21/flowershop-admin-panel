import { useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { INVENTORY_QUALITIES } from '@/shared/constants/inventory';
import type { NewInventoryItem } from '@/shared/models/inventory';
import { InventoryFormModal } from './inventory/InventoryFormModal';
import {
  parseBulkInventoryInput,
  type BulkInventoryParseError,
  type ParsedBulkInventoryRow,
} from './inventory/bulkInventoryParser';

interface AddInventoryModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (item: NewInventoryItem) => Promise<void> | void;
  onConfirmBulk?: (items: NewInventoryItem[]) => Promise<void> | void;
}

type AddInventoryFormState = Omit<NewInventoryItem, 'unitPrice'>;

const ADD_INVENTORY_FORM_ID = 'add-inventory-form';
const ADD_INVENTORY_TITLE_ID = 'add-inventory-title';
const ADD_INVENTORY_BULK_STATUS_ID = 'add-inventory-bulk-status';

const INITIAL_FORM_DATA: AddInventoryFormState = {
  item: '',
  quantity: 0,
  quality: '',
};

export function AddInventoryModal({
  open,
  onCancel,
  onConfirm,
  onConfirmBulk,
}: AddInventoryModalProps) {
  const [formData, setFormData] = useState<AddInventoryFormState>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkQuality, setBulkQuality] = useState(INVENTORY_QUALITIES.REGULAR);
  const [bulkRows, setBulkRows] = useState<ParsedBulkInventoryRow[]>([]);
  const [bulkErrors, setBulkErrors] = useState<BulkInventoryParseError[]>([]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setBulkInput('');
    setBulkRows([]);
    setBulkErrors([]);
    setBulkQuality(INVENTORY_QUALITIES.REGULAR);
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

  const parseSummary = useMemo(() => {
    if (bulkRows.length === 0 && bulkErrors.length === 0) {
      return 'Sin resultados aún. Procesa la lista para ver filas detectadas.';
    }

    return `${bulkRows.length} fila(s) lista(s) y ${bulkErrors.length} línea(s) con error.`;
  }, [bulkErrors.length, bulkRows.length]);

  const handleParseBulk = () => {
    if (!bulkInput.trim()) {
      toast.error('Pega una lista para procesar');
      setBulkRows([]);
      setBulkErrors([]);
      return;
    }

    const parsed = parseBulkInventoryInput(bulkInput, bulkQuality);
    setBulkRows(parsed.rows);
    setBulkErrors(parsed.errors);

    if (parsed.rows.length > 0) {
      toast.success(`Se detectaron ${parsed.rows.length} artículo(s)`);
    } else {
      toast.error('No se detectaron filas válidas');
    }
  };

  const handleRemoveBulkRow = (index: number) => {
    setBulkRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleBulkSubmit = async () => {
    if (bulkRows.length === 0) {
      toast.error('No hay filas para agregar');
      return;
    }

    setIsBulkSubmitting(true);

    try {
      const payload = bulkRows.map((row) => ({
        item: row.item,
        quantity: row.quantity,
        quality: row.quality,
        unitPrice: 0,
      }));

      if (onConfirmBulk) {
        await onConfirmBulk(payload);
      } else {
        for (const item of payload) {
          await onConfirm(item);
        }
      }

      resetForm();
    } finally {
      setIsBulkSubmitting(false);
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

          <section
            aria-labelledby="inventory-bulk-title"
            className="rounded-xl border border-border/70 bg-muted/20 p-4"
          >
            <div className="mb-3 space-y-1">
              <h4 className="text-sm font-semibold text-foreground" id="inventory-bulk-title">
                Carga masiva
              </h4>
              <p className="text-xs text-muted-foreground">
                Pega una línea por producto. Ejemplos: "5 docenas de rosa", "7 docenas de
                girasoles", "media docena de tulipanes".
              </p>
            </div>

            <InventoryFormModal.Field
              label="Lista de inventario"
              htmlFor="inventory-bulk-input"
              hint="Puedes usar cantidad en unidades o en docenas."
            >
              <textarea
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
                id="inventory-bulk-input"
                placeholder="5 docenas de rosa&#10;7 docenas de girasoles&#10;media docena de tulipanes"
                value={bulkInput}
                onChange={(event) => setBulkInput(event.target.value)}
              />
            </InventoryFormModal.Field>

            <InventoryFormModal.Field
              label="Calidad por defecto"
              htmlFor="inventory-bulk-quality"
            >
              <select
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                id="inventory-bulk-quality"
                value={bulkQuality}
                onChange={(event) => setBulkQuality(event.target.value)}
              >
                <option value={INVENTORY_QUALITIES.SPECIAL}>Especial</option>
                <option value={INVENTORY_QUALITIES.REGULAR}>Regular</option>
              </select>
            </InventoryFormModal.Field>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleParseBulk}
                disabled={isSubmitting || isBulkSubmitting}
              >
                Procesar lista
              </Button>
              <Button
                type="button"
                onClick={handleBulkSubmit}
                disabled={bulkRows.length === 0 || isSubmitting || isBulkSubmitting}
              >
                {isBulkSubmitting ? 'Agregando lote...' : 'Agregar lote'}
              </Button>
            </div>

            <p
              className="mt-3 text-xs text-muted-foreground"
              id={ADD_INVENTORY_BULK_STATUS_ID}
              role="status"
              aria-live="polite"
            >
              {parseSummary}
            </p>

            {bulkRows.length > 0 ? (
              <div className="mt-3 max-h-44 overflow-auto rounded-md border border-border/60 bg-background">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Artículo</th>
                      <th className="px-3 py-2 text-left">Cantidad</th>
                      <th className="px-3 py-2 text-left">Calidad</th>
                      <th className="px-3 py-2 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkRows.map((row, index) => (
                      <tr className="border-t border-border/50" key={`${row.item}-${index}`}>
                        <td className="px-3 py-2">{row.item}</td>
                        <td className="px-3 py-2">{row.quantity}</td>
                        <td className="px-3 py-2 capitalize">{row.quality}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            aria-label={`Quitar ${row.item}`}
                            className="text-xs font-medium text-destructive hover:underline"
                            onClick={() => handleRemoveBulkRow(index)}
                            type="button"
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {bulkErrors.length > 0 ? (
              <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs font-medium text-destructive">Líneas con error</p>
                <ul className="mt-1 space-y-1 text-xs text-destructive/90">
                  {bulkErrors.map((error) => (
                    <li key={`${error.lineNumber}-${error.raw}`}>
                      Línea {error.lineNumber}: {error.reason} ({error.raw})
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </InventoryFormModal.Body>

        <InventoryFormModal.Footer
          formId={ADD_INVENTORY_FORM_ID}
          onCancel={handleCancel}
          submitLabel="Agregar manualmente"
          isSubmitting={isSubmitting || isBulkSubmitting}
        />
      </form>
    </InventoryFormModal.Frame>
  );
}
