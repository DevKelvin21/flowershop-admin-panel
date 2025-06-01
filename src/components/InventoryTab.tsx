import { useState, useEffect } from 'react'
import { getInventory, type InventoryItem } from '../db/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import ConfirmModal from './ConfirmModal'

function EditableTable({ data, columns, onChange, onDelete }: {
  data: any[],
  columns: { key: string, label: string }[],
  onChange: (rowIdx: number, colKey: string, value: any) => void,
  onDelete: (rowIdx: number) => void
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
          <th className="px-4 py-2 text-left font-semibold text-rose-800">Eliminar</th>
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
            <td className="px-4 py-2">
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => onDelete(rowIdx)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </td>
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
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'delete' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [pendingEdit, setPendingEdit] = useState<{ rowIdx: number, colKey: string, value: any } | null>(null);

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

  const qualityTypes = Array.from(new Set(inventory.map(item => item.quality).filter(Boolean)));

  const filteredInventory = inventory.filter(item => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      (item.item && item.item.toLowerCase().includes(searchText)) ||
      (item.quantity && String(item.quantity).toLowerCase().includes(searchText)) ||
      (item.quality && String(item.quality).toLowerCase().includes(searchText));
    let matchesFilter = true;
    if (filter === 'outofstock') {
      matchesFilter = Number(item.quantity) === 0;
    } else if (filter !== 'all') {
      matchesFilter = item.quality === filter;
    }
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-rose-700">Inventario</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="px-3 py-2 border border-rose-200 rounded w-full focus:ring-2 focus:ring-rose-400"
          placeholder="Buscar en inventario..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="px-3 py-2 border border-rose-200 rounded focus:ring-2 focus:ring-rose-400"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="outofstock">Sin stock</option>
          {qualityTypes.map(q => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>
      <EditableTable
        data={filteredInventory}
        columns={[
          { key: 'item', label: 'Nombre de Articulo' },
          { key: 'quantity', label: 'Cantidad' },
          { key: 'quality', label: 'Calidad' },
          { key: 'lastUpdated', label: 'Última Actualización' }
        ]}
        onChange={(rowIdx, colKey, value) => {
          setPendingEdit({ rowIdx, colKey, value });
          setSelectedItem(filteredInventory[rowIdx]);
          setModalType('edit');
          setModalOpen(true);
        }}
        onDelete={(rowIdx) => {
          setSelectedItem(filteredInventory[rowIdx]);
          setModalType('delete');
          setModalOpen(true);
        }}
      />
      <ConfirmModal
        open={modalOpen}
        title={modalType === 'delete' ? 'Confirmar eliminación' : 'Confirmar edición'}
        message={modalType === 'delete' ? '¿Estás seguro de que deseas eliminar este artículo del inventario?' : '¿Estás seguro de que deseas editar este artículo?'}
        item={selectedItem}
        onCancel={() => {
          setModalOpen(false);
          setModalType(null);
          setSelectedItem(null);
          setPendingEdit(null);
        }}
        onConfirm={() => {
          if (modalType === 'delete') {
            setInventory(inv => inv.filter(item => item !== selectedItem));
          } else if (modalType === 'edit' && pendingEdit) {
            setInventory(inv =>
              inv.map((row, idx) =>
                idx === pendingEdit.rowIdx ? { ...row, [pendingEdit.colKey]: pendingEdit.value } : row
              )
            );
          }
          setModalOpen(false);
          setModalType(null);
          setSelectedItem(null);
          setPendingEdit(null);
        }}
        confirmLabel={modalType === 'delete' ? 'Eliminar' : 'Editar'}
        cancelLabel="Cancelar"
      />
    </div>
  )
}

export default InventoryTab
