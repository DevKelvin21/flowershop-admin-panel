interface ExpensesViewProps {
    expenses: {
        expense_id: string;
        item: string;
        total_expense_price: number;
        message_sent: string;
    }[];
}

export function ExpensesView({ expenses }: ExpensesViewProps) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-rose-700">Gastos</h2>
            <table className="min-w-full border border-rose-100 rounded-lg overflow-hidden">
                <thead className="bg-rose-50">
                    <tr>
                        <th className="px-4 py-2 text-left font-semibold text-rose-800">Expense ID</th>
                        <th className="px-4 py-2 text-left font-semibold text-rose-800">Item</th>
                        <th className="px-4 py-2 text-left font-semibold text-rose-800">Total Expense Price</th>
                        <th className="px-4 py-2 text-left font-semibold text-rose-800">Message Sent</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                        <tr key={expense.expense_id} className="even:bg-rose-50">
                            <td className="px-4 py-2">{expense.expense_id}</td>
                            <td className="px-4 py-2">{expense.item}</td>
                            <td className="px-4 py-2">${expense.total_expense_price}</td>
                            <td className="px-4 py-2">{expense.message_sent}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}