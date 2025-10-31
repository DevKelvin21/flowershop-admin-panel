import type { InventoryItem } from '../shared/models/inventory'
import { EditableTable } from './EditableTable'
import { ConfirmModal } from './modals/ConfirmModal'
import { Filters } from './Filters'
import { AddInventoryModal } from './modals/AddInventoryModal'
import { ErrorMessage } from './ErrorMessage'
import { LoadingSpinner } from './LoadingSpinner'

interface InventoryViewProps {

  loading: boolean;
  error: string | null;

  filters: {
    search: string;
    filterType: 'all' | 'outofstock' | string;
    filterTypeOptions: string[];

    setSearch: (search: string) => void;
    setFilterType: (filterType: 'all' | 'outofstock' | string) => void;
  };

  table: {
    filteredInventory: InventoryItem[];
    columns: { key: string; label: string }[];
    pendingEdit: { rowIdx: number, colKey: string, value: string } | null;

    handleEditableTableChange: (rowIdx: number, colKey: string, value: string) => void;
    handleEditableTableDelete: (rowIdx: number) => void;
  };

  modals: {
    isAddModalOpen: boolean;
    isConfirmModalOpen: boolean;
    confirmModalType: 'delete' | 'edit' | null;
    confirmModalSelectedItem: InventoryItem | null;
    confirmModalPendingEdit: { rowIdx: number, colKey: string, value: string } | null;

    openAddModal: () => void;
    closeAddModal: () => void;
    openConfirmModal: () => void;
    closeConfirmModal: () => void;
    handleAddInventory: (item: InventoryItem) => void;
    handleCancelConfirmModal: () => void;
    handleSubmitConfirmModal: () => void;
  };

}

export function InventoryView({
  loading,
  error,
  filters,
  table,
  modals,
}: InventoryViewProps) {

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mb-4 text-rose-700">Inventario</h2>
        <button
          className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700"
          onClick={modals.openAddModal}
        >
          Agregar Inventario
        </button>
      </div>
      <Filters
        search={{
          value: filters.search,
          onChange: filters.setSearch,
          placeholder: 'Buscar en inventario...'
        }}
        selects={[{
          key: 'type',
          value: filters.filterType,
          onChange: filters.setFilterType,
          options: [
            { value: 'all', label: 'Todos' },
            { value: 'outofstock', label: 'Sin stock' },
            ...filters.filterTypeOptions.map(q => ({ value: q, label: q }))
          ]
        }]}
      />
      <EditableTable
        data={table.filteredInventory}
        columns={[
          { key: 'item', label: 'Nombre de Articulo' },
          { key: 'quantity', label: 'Cantidad' },
          { key: 'quality', label: 'Calidad' },
          { key: 'lastUpdated', label: 'Última Actualización' }
        ]}
        onChange={table.handleEditableTableChange}
        onDelete={table.handleEditableTableDelete}
      />
      <ConfirmModal
        open={modals.isConfirmModalOpen}
        title={modals.confirmModalType === 'delete' ? 'Confirmar eliminación' : 'Confirmar edición'}
        message={modals.confirmModalType === 'delete' ? '¿Estás seguro de que deseas eliminar este artículo del inventario?' : '¿Estás seguro de que deseas editar este artículo?'}
        item={modals.confirmModalSelectedItem}
        pendingEdit={modals.confirmModalPendingEdit}
        onCancel={modals.handleCancelConfirmModal}
        onConfirm={modals.handleSubmitConfirmModal}
        confirmLabel={modals.confirmModalType === 'delete' ? 'Eliminar' : 'Editar'}
        cancelLabel="Cancelar"
      />
      <AddInventoryModal
        open={modals.isAddModalOpen}
        onCancel={modals.closeAddModal}
        onConfirm={modals.handleAddInventory}
        onError={console.error}
      />
    </div>
  );
}
