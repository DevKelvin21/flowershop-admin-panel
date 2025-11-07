import type { InventoryLoss } from '../../shared/models/inventory';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Filters } from '../../components/Filters';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { AddInventoryLossModal } from '../../components/modals/AddInventoryLossModal';
import { ConfirmActionModal } from '../../components/modals/ConfirmActionModal';

interface LossInventoryViewProps {

  data: {
    loading: boolean;
    error: string | null;
    selectedLoss: InventoryLoss | null;
    itemOptions: string[];
    setSelectedLoss: (loss: InventoryLoss | null) => void;
  }

  filters: {
    inventoryQualityTypes: string[];
    filteredLosses: InventoryLoss[];
    search: string;
    filterDate: { from: string; to: string };
    setSearch: (search: string) => void;
    setFilterDate: (filterDate: { from: string; to: string }) => void;
  }

  modals: {
    isAddModalOpen: boolean;
    isConfirmModalOpen: boolean;
    confirmModalType: 'delete' | 'edit' | null;
    confirmModalSelectedItem: InventoryLoss | null;
    confirmModalPendingEdit: { rowIdx: number, colKey: string, value: string } | null;

    openAddModal: () => void;
    closeAddModal: () => void;
    openConfirmModal: () => void;
    closeConfirmModal: () => void;
    handleAddLoss: (loss: InventoryLoss) => void;
    handleConfirmDeleteLoss: () => void;
    handleCancelDeleteLoss: () => void;
  }
}

export function LossInventoryView({
  data,
  filters,
  modals,
}: LossInventoryViewProps) {

  if (data.loading) return <LoadingSpinner />;
  if (data.error) return <ErrorMessage error={data.error} />;

  return (
    <div>
      <div className="flex gap-2 mb-4 justify-between items-center">
        <h2 className="text-xl font-semibold mb-4 text-primary">Pérdidas de Inventario</h2>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          onClick={modals.openAddModal}
        >
          Agregar Pérdida
        </button>
      </div>
      <Filters
        search={{
          value: filters.search,
          onChange: filters.setSearch,
          placeholder: 'Buscar en pérdidas...'
        }}
        dateRange={{
          value: {
            from: filters.filterDate.from,
            to: filters.filterDate.to,
          },
          onChange: (next) => filters.setFilterDate({ from: next.from || '', to: next.to || '' }),
          fromPlaceholder: 'Desde',
          toPlaceholder: 'Hasta',
          fromInputProps: {
            type: 'date',
          },
          toInputProps: {
            type: 'date',
          },
        }}
      />
      {/**TODO: Make a table component or reuse EditableTable component */}
      <table className="min-w-full border border-border rounded-lg overflow-hidden bg-card text-card-foreground">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-primary">Artículo</th>
            <th className="px-4 py-2 text-left font-semibold text-primary">Calidad</th>
            <th className="px-4 py-2 text-left font-semibold text-primary">Cantidad</th>
            <th className="px-4 py-2 text-left font-semibold text-primary">Fecha</th>
            <th className="px-4 py-2 text-left font-semibold text-primary">Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {filters.filteredLosses.map(loss => (
            <tr key={loss.id} className="even:bg-muted/50">
              <td className="px-4 py-2">{loss.item}</td>
              <td className="px-4 py-2">{loss.quality}</td>
              <td className="px-4 py-2">{loss.quantity}</td>
              <td className="px-4 py-2">{loss.timestamp.slice(0, 10)}</td>
              <td className="px-4 py-2">
                <button
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1 rounded"
                  onClick={() => { data.setSelectedLoss(loss); modals.openConfirmModal(); }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AddInventoryLossModal
        itemOptions={data.itemOptions}
        inventoryQualityTypes={filters.inventoryQualityTypes}
        open={modals.isAddModalOpen}
        onCancel={modals.closeAddModal}
        onConfirm={modals.handleAddLoss}
        onError={console.error}
      />

      <ConfirmActionModal
        open={modals.isConfirmModalOpen}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar esta pérdida? Esto restaurará la cantidad en inventario."
        item={data.selectedLoss}
        onCancel={modals.handleCancelDeleteLoss}
        onConfirm={modals.handleConfirmDeleteLoss}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
      />
    </div>
  );
}
