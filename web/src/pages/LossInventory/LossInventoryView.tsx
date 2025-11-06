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
        <h2 className="text-xl font-semibold mb-4 text-rose-700">Pérdidas de Inventario</h2>
        <button
          className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700"
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
      <table className="min-w-full border border-rose-100 rounded-lg overflow-hidden">
        <thead className="bg-rose-50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-rose-800">Artículo</th>
            <th className="px-4 py-2 text-left font-semibold text-rose-800">Calidad</th>
            <th className="px-4 py-2 text-left font-semibold text-rose-800">Cantidad</th>
            <th className="px-4 py-2 text-left font-semibold text-rose-800">Fecha</th>
            <th className="px-4 py-2 text-left font-semibold text-rose-800">Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {filters.filteredLosses.map(loss => (
            <tr key={loss.id} className="even:bg-rose-50">
              <td className="px-4 py-2">{loss.item}</td>
              <td className="px-4 py-2">{loss.quality}</td>
              <td className="px-4 py-2">{loss.quantity}</td>
              <td className="px-4 py-2">{loss.timestamp.slice(0, 10)}</td>
              <td className="px-4 py-2">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
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
