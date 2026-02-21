import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router';
import { auditListOptions } from '@/hooks/queries/audit';

const AuditContainer = lazyRouteComponent(
  () => import('@/pages/Audit/AuditContainer'),
  'AuditContainer',
);

export const Route = createFileRoute('/_authenticated/audit')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      auditListOptions({ page: 1, limit: 20 }),
    );
  },
  component: AuditContainer,
});
