import { useState } from 'react'
import './App.css'

const LOOKER_STUDIO_URL = 'https://lookerstudio.google.com/embed/reporting/4a27224e-dfd6-4bd1-928f-f9568d78253a/page/vlVIF' // Replace with real URL

const inventoryMock = [
  { name: 'Roses', quantity: 120, quality: 'Excellent' },
  { name: 'Tulips', quantity: 80, quality: 'Good' },
  { name: 'Party Balloons', quantity: 200, quality: 'Fair' },
  { name: 'Gift Baskets', quantity: 30, quality: 'Excellent' },
]

const transactionsMock = [
  { transaction_id: 'TXN001', item: 'Roses', total_sale_price: 150, message_sent: 'Yes' },
  { transaction_id: 'TXN002', item: 'Party Balloons', total_sale_price: 60, message_sent: 'No' },
  { transaction_id: 'TXN003', item: 'Gift Baskets', total_sale_price: 90, message_sent: 'Yes' },
]

function EditableTable({ data, columns, onChange }: {
  data: any[],
  columns: { key: string, label: string }[],
  onChange: (rowIdx: number, colKey: string, value: any) => void
}) {
  const [editing, setEditing] = useState<{ row: number, col: string } | null>(null)
  const [editValue, setEditValue] = useState('')

  return (
    <table className="min-w-full border border-rose-100 rounded-lg overflow-hidden">
      <thead className="bg-rose-50">
        <tr>
          {columns.map(col => (
            <th key={col.key} className="px-4 py-2 text-left font-semibold text-rose-800">{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx} className="even:bg-rose-50">
            {columns.map(col => (
              <td
                key={col.key}
                className="px-4 py-2 cursor-pointer"
                onClick={() => {
                  setEditing({ row: rowIdx, col: col.key })
                  setEditValue(row[col.key])
                }}
              >
                {editing && editing.row === rowIdx && editing.col === col.key ? (
                  <input
                    className="border border-rose-200 rounded px-2 py-1 w-full focus:ring-2 focus:ring-rose-400"
                    value={editValue}
                    autoFocus
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={() => {
                      onChange(rowIdx, col.key, editValue)
                      setEditing(null)
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        onChange(rowIdx, col.key, editValue)
                        setEditing(null)
                      }
                    }}
                  />
                ) : (
                  row[col.key]
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function App() {
  const [tab, setTab] = useState(0)
  const [inventory, setInventory] = useState(inventoryMock)
  const [transactions] = useState(transactionsMock)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-rose-600 text-white py-4 px-8 shadow">
        <h1 className="text-2xl font-bold tracking-wide">FlowerShop Admin Panel</h1>
      </header>
      <main className="flex-1 p-6 flex flex-col items-center">
        <div className="mb-6">
          <nav className="flex space-x-2">
            {['Dashboard', 'Inventory', 'Transactions'].map((label, idx) => (
              <button
                key={label}
                className={`px-4 py-2 rounded-t font-medium transition ${
                  tab === idx
                    ? 'bg-rose-500 text-white shadow'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
                onClick={() => setTab(idx)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <section className="w-full max-w-4xl bg-white rounded shadow p-6 border border-rose-100">
          {tab === 0 && (
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-4 text-rose-700">Sales Dashboard</h2>
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
          )}
          {tab === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-rose-700">Inventory</h2>
              <EditableTable
                data={inventory}
                columns={[
                  { key: 'name', label: 'Item Name' },
                  { key: 'quantity', label: 'Quantity' },
                  { key: 'quality', label: 'Quality' },
                ]}
                onChange={(rowIdx, colKey, value) => {
                  setInventory(inv =>
                    inv.map((row, idx) =>
                      idx === rowIdx ? { ...row, [colKey]: value } : row
                    )
                  )
                }}
              />
            </div>
          )}
          {tab === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-rose-700">Transactions to Review</h2>
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
                  {transactions.map((txn, idx) => (
                    <tr key={idx} className="even:bg-rose-50">
                      <td className="px-4 py-2">{txn.transaction_id}</td>
                      <td className="px-4 py-2">{txn.item}</td>
                      <td className="px-4 py-2">${txn.total_sale_price}</td>
                      <td className="px-4 py-2">{txn.message_sent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
