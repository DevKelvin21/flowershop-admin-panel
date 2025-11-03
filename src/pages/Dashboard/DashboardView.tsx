interface DashboardViewProps {
    lookerStudioUrl: string;
}

export function DashboardView({ lookerStudioUrl }: DashboardViewProps) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-rose-700">Reporte de Ventas y Gastos</h2>
            <iframe
                src={lookerStudioUrl}
                title="Looker Studio Dashboard"
                className="w-full aspect-video border border-rose-100 rounded overflow-hidden"
                frameBorder="0"
                allowFullScreen
            />
        </div>
    );
}
