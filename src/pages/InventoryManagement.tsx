import { useState } from 'react'
import { InventoryView } from '../components/InventoryView'
import type { InventoryItem } from '../shared/models/inventory'
import { useInventory } from '../hooks/useInventory'
import { useModal } from '../hooks/useModal'
import { useInventoryFilters } from '../hooks/useInventoryFilters'
import { useInventoryCommands } from '../hooks/useInventoryCommands'

export function InventoryManagement({ userEmail }: { userEmail: string }) {
    // Inventory data and state
    const { inventory, loading, error, refreshInventory } = useInventory();

    // Filters
    const {
        search,
        filter,
        setSearch,
        setFilter,
        filteredInventory,
        inventoryQualityTypes
    } = useInventoryFilters(inventory);

    // Modals
    const confirmModal = useModal();
    const addModal = useModal();

    // UI/state for modals
    const [confirmModalType, setConfirmModalType] = useState<'delete' | 'edit' | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [pendingEdit, setPendingEdit] = useState<{ rowIdx: number, colKey: string, value: string } | null>(null);

    // Inventory CRUD operations
    const { add, update, remove } = useInventoryCommands(userEmail, refreshInventory);

    const handleCancelConfirmModal = () => {
        confirmModal.close();
        setConfirmModalType(null);
        setSelectedItem(null);
        setPendingEdit(null);
    }

    const handleSubmitConfirmModal = () => {
        if (confirmModalType === 'delete') {
            if (selectedItem) {
                remove(selectedItem);
            }
        } else if (confirmModalType === 'edit' && pendingEdit && selectedItem) {
            update({
                ...selectedItem,
                [pendingEdit.colKey]: pendingEdit.value,
            });
        }
        confirmModal.close();
        setConfirmModalType(null);
        setSelectedItem(null);
        setPendingEdit(null);
    }

    const handleEditableTableChange = (rowIdx: number, colKey: string, value: string) => {
        setPendingEdit({ rowIdx, colKey, value });
        setSelectedItem(filteredInventory[rowIdx]);
        setConfirmModalType('edit');
        confirmModal.open();
    }

    const handleEditableTableDelete = (rowIdx: number) => {
        setSelectedItem(filteredInventory[rowIdx]);
        setConfirmModalType('delete');
        confirmModal.open();
    }

    return (
        <InventoryView
            loading={loading}
            error={error}
            filters={{
                search: search,
                filterType: filter,
                setSearch: setSearch,
                setFilterType: setFilter,
                filterTypeOptions: inventoryQualityTypes,
            }}
            table={{
                filteredInventory: filteredInventory,
                columns: [
                    { key: 'item', label: 'Nombre de Articulo' },
                    { key: 'quantity', label: 'Cantidad' },
                    { key: 'quality', label: 'Calidad' },
                    { key: 'lastUpdated', label: 'Última Actualización' },
                ],
                pendingEdit: pendingEdit,
                handleEditableTableChange: handleEditableTableChange,
                handleEditableTableDelete: handleEditableTableDelete,
            }}
            modals={{
                isConfirmModalOpen: confirmModal.isOpen,
                isAddModalOpen: addModal.isOpen,
                confirmModalType: confirmModalType,
                confirmModalSelectedItem: selectedItem,
                confirmModalPendingEdit: pendingEdit,
                openConfirmModal: confirmModal.open,
                closeConfirmModal: confirmModal.close,
                openAddModal: addModal.open,
                closeAddModal: addModal.close,
                handleAddInventory: add,
                handleCancelConfirmModal: handleCancelConfirmModal,
                handleSubmitConfirmModal: handleSubmitConfirmModal,
            }}
        />
    );
}
