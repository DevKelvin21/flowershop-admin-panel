import {
  createFileRoute,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router';
import { usersListOptions, usersMeOptions } from '@/hooks/queries/users';

const UsersContainer = lazyRouteComponent(
  () => import('@/pages/Users/UsersContainer'),
  'UsersContainer',
);

export const Route = createFileRoute('/_authenticated/users')({
  beforeLoad: async ({ context }) => {
    const currentUser = await context.queryClient.ensureQueryData(usersMeOptions());

    if (currentUser.role !== 'OWNER') {
      throw redirect({ to: '/' });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(usersListOptions({ page: 1, limit: 20 }));
  },
  component: UsersContainer,
});
