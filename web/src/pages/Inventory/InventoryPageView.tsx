import type {
  InventoryItem,
  InventoryLoss,
  NewInventoryItem,
} from '@/shared/models/inventory';
import { EditableTable } from '@/components/EditableTable';
import { ConfirmActionModal } from '@/components/modals/ConfirmActionModal';
import { Filters } from '@/components/Filters';
import { AddInventoryModal } from '@/components/modals/AddInventoryModal';
import { AddInventoryLossModal } from '@/components/modals/AddInventoryLossModal';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Props for the InventoryPageView component.
 * Grouped by concern following the project's View pattern.
 */
export interface InventoryPageViewProps {
  // Loading and error states
  loading: boolean;
  error: string | null;

  // Tab state
  tabs: {
    activeTab: 'items' | 'losses';
    onTabChange: (tab: 'items' | 'losses') => void;
  };

  // Inventory tab props
  inventory: {
    data: InventoryItem[];
    qualityOptions: string[];
    filters: {
      search: string;
      qualityFilter: string;
      onSearchChange: (search: string) => void;
      onQualityFilterChange: (filter: string) => void;
    };
    table: {
      onEdit: (rowIdx: number, colKey: string, value: string) => void;
      onDelete: (rowIdx: number) => void;
    };
  };

  // Losses tab props
  losses: {
    data: InventoryLoss[];
    filters: {
      search: string;
      dateRange: { from: string; to: string };
      onSearchChange: (search: string) => void;
      onDateRangeChange: (range: { from: string; to: string }) => void;
    };
  };

  // Modal props
  modals: {
    addItem: {
      isOpen: boolean;
      onOpen: () => void;
      onClose: () => void;
      onSubmit: (item: NewInventoryItem) => Promise<void> | void;
    };
    addLoss: {
      isOpen: boolean;
      onOpen: () => void;
      onClose: () => void;
      onSubmit: (loss: { inventoryId?: string; quantity: number; reason?: string; notes?: string }) => void;
    };
    confirm: {
      isOpen: boolean;
      type: 'delete' | 'edit' | null;
      selectedItem: InventoryItem | null;
      pendingEdit: { rowIdx: number; colKey: string; value: string } | null;
      onCancel: () => void;
      onConfirm: () => void;
    };
  };
}

/**
 * Pure presentational component for the Inventory page.
 * Receives all state and callbacks via props - no hooks or services.
 */
export function InventoryPageView({
  loading,
  error,
  tabs,
  inventory,
  losses,
  modals,
}: InventoryPageViewProps) {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  const outOfStockCount = inventory.data.filter((item) => item.quantity === 0).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-border/70 bg-muted/30 p-4 md:col-span-2">
          <h2 className="font-serif text-2xl text-primary">Inventario y Pérdidas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra el stock activo, registra pérdidas y controla quiebres de inventario.
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Stock crítico</p>
          <p className="mt-2 text-2xl font-semibold text-destructive">{outOfStockCount}</p>
          <p className="text-xs text-muted-foreground">artículos sin existencias</p>
        </div>
      </div>

      <Tabs value={tabs.activeTab} onValueChange={(v) => tabs.onTabChange(v as 'items' | 'losses')}>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="items">Inventario</TabsTrigger>
            <TabsTrigger value="losses">Pérdidas</TabsTrigger>
          </TabsList>
          <button
            className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            onClick={tabs.activeTab === 'items' ? modals.addItem.onOpen : modals.addLoss.onOpen}
          >
            {tabs.activeTab === 'items' ? 'Agregar Inventario' : 'Agregar Pérdida'}
          </button>
        </div>

        {/* Inventory Items Tab */}
        <TabsContent value="items">
          <Filters
            search={{
              value: inventory.filters.search,
              onChange: inventory.filters.onSearchChange,
              placeholder: 'Buscar en inventario...',
            }}
            selects={[
              {
                key: 'quality',
                value: inventory.filters.qualityFilter,
                onChange: inventory.filters.onQualityFilterChange,
                options: [
                  { value: 'all', label: 'Todos' },
                  { value: 'outofstock', label: 'Sin stock' },
                  ...inventory.qualityOptions.map((q) => ({ value: q, label: q })),
                ],
              },
            ]}
          />
          <EditableTable
            data={inventory.data}
            columns={[
              { key: 'item', label: 'Nombre de Articulo' },
              { key: 'quantity', label: 'Cantidad' },
              { key: 'quality', label: 'Calidad' },
              { key: 'lastUpdated', label: 'Última Actualización' },
            ]}
            onChange={inventory.table.onEdit}
            onDelete={inventory.table.onDelete}
          />
        </TabsContent>

        {/* Losses Tab */}
        <TabsContent value="losses">
          <Filters
            search={{
              value: losses.filters.search,
              onChange: losses.filters.onSearchChange,
              placeholder: 'Buscar en pérdidas...',
            }}
            dateRange={{
              value: losses.filters.dateRange,
              onChange: (next) =>
                losses.filters.onDateRangeChange({ from: next.from || '', to: next.to || '' }),
              fromPlaceholder: 'Desde',
              toPlaceholder: 'Hasta',
            }}
          />
          <LossesTable data={losses.data} />
        </TabsContent>
      </Tabs>

      {/* Add Inventory Modal */}
      <AddInventoryModal
        open={modals.addItem.isOpen}
        onCancel={modals.addItem.onClose}
        onConfirm={modals.addItem.onSubmit}
      />

      {/* Add Loss Modal */}
      <AddInventoryLossModal
        inventoryOptions={inventory.data}
        open={modals.addLoss.isOpen}
        onCancel={modals.addLoss.onClose}
        onConfirm={modals.addLoss.onSubmit}
      />

      {/* Confirm Modal */}
      <ConfirmActionModal
        open={modals.confirm.isOpen}
        title={modals.confirm.type === 'delete' ? 'Confirmar eliminación' : 'Confirmar edición'}
        message={getConfirmMessage(modals.confirm.type, modals.confirm.selectedItem)}
        item={modals.confirm.selectedItem}
        pendingEdit={modals.confirm.pendingEdit}
        onCancel={modals.confirm.onCancel}
        onConfirm={modals.confirm.onConfirm}
        confirmLabel={modals.confirm.type === 'delete' ? 'Eliminar' : 'Editar'}
        cancelLabel="Cancelar"
      />
    </div>
  );
}

/**
 * Sub-component for the losses table.
 * Kept in the same file since it's tightly coupled to this view.
 */
function LossesTable({
  data,
}: {
  data: InventoryLoss[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-sm">
      <table className="min-w-full text-card-foreground">
        <thead className="bg-muted/70">
          <tr>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-muted-foreground">Artículo</th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-muted-foreground">Calidad</th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-muted-foreground">Cantidad</th>
            <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-muted-foreground">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {data.map((loss) => (
            <tr key={loss.id} className="border-t border-border/50 transition-colors even:bg-muted/20 hover:bg-muted/40">
              <td className="px-4 py-3">{loss.item}</td>
              <td className="px-4 py-3">{loss.quality}</td>
              <td className="px-4 py-3">{loss.quantity}</td>
              <td className="px-4 py-3">{new Date(loss.timestamp).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getConfirmMessage(
  type: 'delete' | 'edit' | null,
  item: InventoryItem | null
): string {
  if (type === 'delete') {
    return `¿Estás seguro de que deseas eliminar ${item?.item || 'este artículo'} del inventario?`;
  }
  return '¿Estás seguro de que deseas editar este artículo?';
}
