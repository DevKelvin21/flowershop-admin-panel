interface SalesViewProps {
    sales: {
        sale_id: string;
        item: string;
        total_sale_price: number;
        message_sent: string;
    }[];
}

export function SalesView({ sales }: SalesViewProps) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-rose-700">Ventas</h2>
            <table className="min-w-full border border-rose-100 rounded-lg overflow-hidden">
                <thead className="bg-rose-50">
                    <tr>
                        <th className="px-4 py-2 text-left font-semibold text-rose-800">Sale ID</th>
                        <th className="px-4 py-2 text-left font-semibold text-rose-800">Item</th>
                        <th className="px-4 py-2 text-left font-semibold text-rose-800">Total Sale Price</th>
                        <th className="px-4 py-2 text-left font-semibold text-rose-800">Message Sent</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map((sale) => (
                        <tr key={sale.sale_id} className="even:bg-rose-50">
                            <td className="px-4 py-2">{sale.sale_id}</td>
                            <td className="px-4 py-2">{sale.item}</td>
                            <td className="px-4 py-2">${sale.total_sale_price}</td>
                            <td className="px-4 py-2">{sale.message_sent}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}