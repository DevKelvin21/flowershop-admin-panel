import { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useInventory } from '../../hooks/useInventory';
import { useInventoryCommands } from '../../hooks/useInventoryCommands';
import { useLossFilters } from '../../hooks/useLossFilters';
import { useModal } from '../../hooks/useModal';
import { authService, inventoryService } from '../../services';
import type { InventoryLoss } from '../../shared/models/inventory';
import { LossInventoryView } from './LossInventoryView';


export function LossInventoryContainer() {
    const { user } = useAuth(authService);
    const userEmail = user?.email || '';
    /**
     * Data loading: fetch inventory and losses with loading/error state.
     */
    const { inventory, losses, loading, error, refreshLosses, refreshInventory } = useInventory(inventoryService);

    /**
     * Commands: actions that mutate inventory/losses, wired with refresh callbacks.
     */
    const { addLoss, removeLoss } = useInventoryCommands(inventoryService, userEmail, refreshLosses, refreshInventory);

    /**
     * UI state: modal visibility and selected loss for confirmation.
     */
    const addLossModal = useModal();
    const confirmModal = useModal();
    const [selectedLoss, setSelectedLoss] = useState<InventoryLoss | null>(null);

    /**
     * Filters: search text, date range and derived filtered datasets.
     */
    const { search, setSearch, inventoryQualityTypes, filteredLosses, filterDate, setFilterDate } =
        useLossFilters(inventory, losses);

    /**
     * Derived values: unique, non-empty, sorted item names for dropdowns.
     */
    const itemOptions = useMemo(
        () => Array.from(new Set(inventory.map(i => i.item).filter(Boolean))).sort(),
        [inventory]
    );

    const handleDeleteLoss = async () => {
        if (selectedLoss) {
            try {
                await removeLoss(selectedLoss);
                confirmModal.close();
                setSelectedLoss(null);
            } catch (err) {
                console.error('Error eliminando la pérdida:', err);
            }
        }
    }

    const handleCancelDeleteLoss = () => {
        confirmModal.close();
        setSelectedLoss(null);
    }

    return (
        <LossInventoryView
            data={{
                loading,
                error,
                selectedLoss,
                setSelectedLoss,
                itemOptions,
            }}
            filters={{
                inventoryQualityTypes,
                filteredLosses,
                search,
                filterDate: { from: filterDate.from || '', to: filterDate.to || '' },
                setSearch,
                setFilterDate,
            }}
            modals={{
                isAddModalOpen: addLossModal.isOpen,
                isConfirmModalOpen: confirmModal.isOpen,
                confirmModalType: 'delete',
                confirmModalSelectedItem: selectedLoss,
                confirmModalPendingEdit: null,
                openAddModal: addLossModal.open,
                closeAddModal: addLossModal.close,
                openConfirmModal: confirmModal.open,
                closeConfirmModal: confirmModal.close,
                handleAddLoss: addLoss,
                handleConfirmDeleteLoss: handleDeleteLoss,
                handleCancelDeleteLoss: handleCancelDeleteLoss,
            }}
        />
    );
}