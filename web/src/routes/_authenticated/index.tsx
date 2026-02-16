import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router';

const DashboardRoute = lazyRouteComponent(
  () => import('@/pages/Dashboard/DashboardRoute'),
  'DashboardRoute',
);

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardRoute,
});
