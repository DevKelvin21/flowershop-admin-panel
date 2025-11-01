const LOOKER_STUDIO_URL = 'https://lookerstudio.google.com/embed/reporting/4a27224e-dfd6-4bd1-928f-f9568d78253a/page/vlVIF'

/**TODO: make dynamic dashboard, add filters, charts, etc. */
export function DashboardPage() {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4 text-rose-700">Reporte de Ventas y Gastos</h2>
      <div className="w-full aspect-video border border-rose-100 rounded overflow-hidden">
        <iframe
          src={LOOKER_STUDIO_URL}
          title="Looker Studio Dashboard"
          className="w-full h-full"
          frameBorder={0}
          allowFullScreen
        />
      </div>
    </div>
  )
}
