import { useState, useEffect } from 'react'
import { getInventory, type InventoryItem } from '../db/utils'



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

function InventoryTab() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await getInventory();
        setInventory(items);
      } catch (error: any) {
        setError(error?.message || 'Error fetching inventory');
      } finally {
        setLoading(false);
      }
    }
    fetchInventory()
  }, [])

  if (loading) {
    return <div className="text-rose-700">Cargando inventario...</div>;
  }

  if (error) {
    return <div className="text-red-600 font-semibold">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-rose-700">Inventario</h2>
      <EditableTable
        data={inventory || []}
        columns={[
          { key: 'item', label: 'Item Name' },
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
  )
}

export default InventoryTab
