import { createFileRoute } from '@tanstack/react-router';
import { DashboardView } from '../../pages/Dashboard/DashboardView';

const lookerStudioUrl = 'https://lookerstudio.google.com/embed/reporting/4a27224e-dfd6-4bd1-928f-f9568d78253a/page/vlVIF';

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardRoute,
});

function DashboardRoute() {
  return <DashboardView lookerStudioUrl={lookerStudioUrl} />;
}
