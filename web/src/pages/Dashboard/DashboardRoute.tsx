import { DashboardView } from './DashboardView';

const lookerStudioUrl =
  'https://lookerstudio.google.com/embed/reporting/4a27224e-dfd6-4bd1-928f-f9568d78253a/page/vlVIF';

export function DashboardRoute() {
  return <DashboardView lookerStudioUrl={lookerStudioUrl} />;
}
