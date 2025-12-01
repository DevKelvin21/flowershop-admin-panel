interface SummaryViewProps {
    summary: {
        summary_id: string;
        item: string;
        total_summary_price: number;
        message_sent: string;
    }[];
}

export function SummaryView({ summary }: SummaryViewProps) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-primary">Resumen</h2>
            <table className="min-w-full border border-border rounded-lg overflow-hidden bg-card text-card-foreground">
                <thead className="bg-muted">
                    <tr>
                        <th className="px-4 py-2 text-left font-semibold text-primary">Summary ID</th>
                        <th className="px-4 py-2 text-left font-semibold text-primary">Item</th>
                        <th className="px-4 py-2 text-left font-semibold text-primary">Total Summary Price</th>
                        <th className="px-4 py-2 text-left font-semibold text-primary">Message Sent</th>
                    </tr>
                </thead>
                <tbody>
                    {summary.map((summary) => (
                        <tr key={summary.summary_id} className="even:bg-muted/50">
                            <td className="px-4 py-2">{summary.summary_id}</td>
                            <td className="px-4 py-2">{summary.item}</td>
                            <td className="px-4 py-2">${summary.total_summary_price}</td>
                            <td className="px-4 py-2">{summary.message_sent}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}