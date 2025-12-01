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
            <h2 className="text-xl font-semibold mb-4 text-primary">Gastos</h2>
            <table className="min-w-full border border-border rounded-lg overflow-hidden bg-card text-card-foreground">
                <thead className="bg-muted">
                    <tr>
                        <th className="px-4 py-2 text-left font-semibold text-primary">Expense ID</th>
                        <th className="px-4 py-2 text-left font-semibold text-primary">Item</th>
                        <th className="px-4 py-2 text-left font-semibold text-primary">Total Expense Price</th>
                        <th className="px-4 py-2 text-left font-semibold text-primary">Message Sent</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                        <tr key={expense.expense_id} className="even:bg-muted/50">
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