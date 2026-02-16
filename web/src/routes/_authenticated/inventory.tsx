import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router';
import {
  inventoryHistoryOptions,
  inventoryListOptions,
} from '@/hooks/queries/inventory';
const InventoryContainer = lazyRouteComponent(
  () => import('@/pages/Inventory/InventoryContainer'),
  'InventoryContainer',
);

export const Route = createFileRoute('/_authenticated/inventory')({
  loader: async ({ context }) => {
    await Promise.allSettled([
      context.queryClient.ensureQueryData(inventoryListOptions()),
      context.queryClient.ensureQueryData(
        inventoryHistoryOptions({ limit: 100 }),
      ),
    ]);
  },
  component: InventoryContainer,
});
