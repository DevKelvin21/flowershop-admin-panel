const transactionsMock = [
  { transaction_id: 'TXN001', item: 'Roses', total_sale_price: 150, message_sent: 'Yes' },
  { transaction_id: 'TXN002', item: 'Party Balloons', total_sale_price: 60, message_sent: 'No' },
  { transaction_id: 'TXN003', item: 'Gift Baskets', total_sale_price: 90, message_sent: 'Yes' },
]

function TransactionsTab() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-rose-700">Transacciones por Revisar</h2>
      <table className="min-w-full border border-rose-100 rounded-lg overflow-hidden">
        <thead className="bg-rose-50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-rose-800">Transaction ID</th>
            <th className="px-4 py-2 text-left font-semibold text-rose-800">Item</th>
            <th className="px-4 py-2 text-left font-semibold text-rose-800">Total Sale Price</th>
            <th className="px-4 py-2 text-left font-semibold text-rose-800">Message Sent</th>
          </tr>
        </thead>
        <tbody>
          {transactionsMock.map((txn) => (
            <tr key={txn.transaction_id} className="even:bg-rose-50">
              <td className="px-4 py-2">{txn.transaction_id}</td>
              <td className="px-4 py-2">{txn.item}</td>
              <td className="px-4 py-2">${txn.total_sale_price}</td>
              <td className="px-4 py-2">{txn.message_sent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionsTab
