import { SalesView } from './SalesView'
import { ExpensesView } from './ExpensesView'
import { SummaryView } from './SummaryView'

const salesMock = [
  { sale_id: 'SALE001', item: 'Roses', total_sale_price: 150, message_sent: 'Yes' },
  { sale_id: 'SALE002', item: 'Party Balloons', total_sale_price: 60, message_sent: 'No' },
  { sale_id: 'SALE003', item: 'Gift Baskets', total_sale_price: 90, message_sent: 'Yes' },
]

const expensesMock = [
  { expense_id: 'EXPENSE001', item: 'Roses', total_expense_price: 150, message_sent: 'Yes' },
  { expense_id: 'EXPENSE002', item: 'Party Balloons', total_expense_price: 60, message_sent: 'No' },
  { expense_id: 'EXPENSE003', item: 'Gift Baskets', total_expense_price: 90, message_sent: 'Yes' },
]

const summaryMock = [
  { summary_id: 'SUMMARY001', item: 'Roses', total_summary_price: 150, message_sent: 'Yes' },
  { summary_id: 'SUMMARY002', item: 'Party Balloons', total_summary_price: 60, message_sent: 'No' },
  { summary_id: 'SUMMARY003', item: 'Gift Baskets', total_summary_price: 90, message_sent: 'Yes' },
]

export function FinancialContainer() {
  return (
    <div>
      <SalesView sales={salesMock} />
      <ExpensesView expenses={expensesMock} />
      <SummaryView summary={summaryMock} />
    </div>
  );
}
