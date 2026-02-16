interface DashboardViewProps {
    lookerStudioUrl: string;
}

export function DashboardView({ lookerStudioUrl }: DashboardViewProps) {
    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-muted/40 p-4">
                <h2 className="font-serif text-2xl text-primary">Reporte de Ventas y Gastos</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Vista ejecutiva de desempeño financiero conectada a Looker Studio.
                </p>
            </div>
            <iframe
                src={lookerStudioUrl}
                title="Looker Studio Dashboard"
                className="w-full aspect-video overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm"
                frameBorder="0"
                allowFullScreen
            />
        </div>
    );
}
