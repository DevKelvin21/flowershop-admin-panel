import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet, Navigate } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundRedirect,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </>
  );
}

function NotFoundRedirect() {
  // Redirect unknown routes to home (which will redirect to login if not authenticated)
  return <Navigate to="/" replace />;
}
