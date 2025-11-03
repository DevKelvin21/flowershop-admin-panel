import { DashboardView } from './DashboardView'

const lookerStudioUrl = 'https://lookerstudio.google.com/embed/reporting/4a27224e-dfd6-4bd1-928f-f9568d78253a/page/vlVIF'

/**TODO: make dynamic dashboard, add filters, charts, etc. */
export function DashboardContainer() {
  return <DashboardView lookerStudioUrl={lookerStudioUrl} />;
}
