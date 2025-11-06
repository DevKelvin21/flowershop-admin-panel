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
            <h2 className="text-xl font-semibold mb-4 text-rose-700">Resumen</h2>
            <table className="min-w-full border border-rose-100 rounded-lg overflow-hidden">
                <thead className="bg-rose-50">
                    <tr>
                        <th className="px-4 py-2 text-left font-semibold text-rose-800">Summary ID</th>
                        <th className="px-4 py-2 text-left font-semibold text-rose-800">Item</th>
                        <th className="px-4 py-2 text-left font-semibold text-rose-800">Total Summary Price</th>
                        <th className="px-4 py-2 text-left font-semibold text-rose-800">Message Sent</th>
                    </tr>
                </thead>
                <tbody>
                    {summary.map((summary) => (
                        <tr key={summary.summary_id} className="even:bg-rose-50">
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