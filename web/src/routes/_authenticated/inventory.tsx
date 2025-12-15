import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/hooks/useModal';
import { authService } from '@/services';
import { useInventoryData, useInventoryCommands } from '@/hooks/useInventoryData';
import { useInventoryPageFilters } from '@/hooks/useInventoryPageFilters';
import { InventoryPageView } from '@/pages/Inventory/InventoryPageView';
import type { Inventory } from '@/lib/api/types';
import type { InventoryItem } from '@/shared/models/inventory';

export const Route = createFileRoute('/_authenticated/inventory')({
  component: InventoryContainer,
});

/**
 * Container component for the Inventory page.
 * Follows the Container/View pattern:
 * - Uses hooks for data and state management
 * - Contains all event handlers and business logic
 * - Passes organized props to the View component
 */
function InventoryContainer() {
  useAuth(authService);

  // Tab state
  const [activeTab, setActiveTab] = useState<'items' | 'losses'>('items');

  // Data hooks
  const {
    inventoryData,
    inventory,
    losses,
    qualityOptions,
    isLoading,
    error,
  } = useInventoryData();

  // Filter hooks
  const filters = useInventoryPageFilters(inventory, losses);

  // Modal state
  const addItemModal = useModal();
  const addLossModal = useModal();
  const confirmModal = useModal();

  // Confirm modal state
  const [confirmModalType, setConfirmModalType] = useState<'delete' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [pendingEdit, setPendingEdit] = useState<{
    rowIdx: number;
    colKey: string;
    value: string;
  } | null>(null);

  // Command hooks with callbacks
  const commands = useInventoryCommands({
    onAddSuccess: () => addItemModal.close(),
    onUpdateSuccess: () => handleCancelConfirmModal(),
    onDeleteSuccess: () => handleCancelConfirmModal(),
    onLossSuccess: () => addLossModal.close(),
    onError: console.error,
  });

  // Event handlers
  const handleEditableTableChange = (rowIdx: number, colKey: string, value: string) => {
    const item = inventoryData?.data[rowIdx];
    if (item) {
      setSelectedItem(item);
      setPendingEdit({ rowIdx, colKey, value });
      setConfirmModalType('edit');
      confirmModal.open();
    }
  };

  const handleEditableTableDelete = (rowIdx: number) => {
    const item = inventoryData?.data[rowIdx];
    if (item) {
      setSelectedItem(item);
      setConfirmModalType('delete');
      confirmModal.open();
    }
  };

  const handleConfirmModalSubmit = async () => {
    if (confirmModalType === 'delete') {
      if (selectedItem) {
        await commands.deleteInventory(selectedItem.id);
      }
    } else if (confirmModalType === 'edit' && selectedItem && pendingEdit) {
      await commands.updateInventory(selectedItem.id, {
        [pendingEdit.colKey]: pendingEdit.value,
      });
    }
  };

  const handleCancelConfirmModal = () => {
    confirmModal.close();
    setConfirmModalType(null);
    setSelectedItem(null);
    setPendingEdit(null);
  };

  // Build selected item for confirm modal display
  const getConfirmSelectedItem = (): InventoryItem | null => {
    if (selectedItem) {
      return {
        item: selectedItem.item,
        quality: selectedItem.quality,
        quantity: selectedItem.quantity,
      };
    }
    return null;
  };

  return (
    <InventoryPageView
      loading={isLoading}
      error={error instanceof Error ? error.message : error ? String(error) : null}
      tabs={{
        activeTab,
        onTabChange: setActiveTab,
      }}
      inventory={{
        data: filters.inventory.filteredData,
        qualityOptions,
        filters: {
          search: filters.inventory.search,
          qualityFilter: filters.inventory.qualityFilter,
          onSearchChange: filters.inventory.setSearch,
          onQualityFilterChange: filters.inventory.setQualityFilter,
        },
        table: {
          onEdit: handleEditableTableChange,
          onDelete: handleEditableTableDelete,
        },
      }}
      losses={{
        data: filters.losses.filteredData,
        filters: {
          search: filters.losses.search,
          dateRange: filters.losses.dateFilter,
          onSearchChange: filters.losses.setSearch,
          onDateRangeChange: filters.losses.setDateFilter,
        },
      }}
      modals={{
        addItem: {
          isOpen: addItemModal.isOpen,
          onOpen: addItemModal.open,
          onClose: addItemModal.close,
          onSubmit: commands.addInventory,
        },
        addLoss: {
          isOpen: addLossModal.isOpen,
          onOpen: addLossModal.open,
          onClose: addLossModal.close,
          onSubmit: commands.addLoss,
        },
        confirm: {
          isOpen: confirmModal.isOpen,
          type: confirmModalType,
          selectedItem: getConfirmSelectedItem(),
          pendingEdit,
          onCancel: handleCancelConfirmModal,
          onConfirm: handleConfirmModalSubmit,
        },
      }}
    />
  );
}
