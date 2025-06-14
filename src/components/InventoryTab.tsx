import { useState, useEffect } from 'react'
import { getInventory, type InventoryItem, updateInventoryItem, removeInventoryItem, addInventoryItem } from '../db/utils'
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
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<{ item: string; quantity: string; quality: string; lastUpdated: string }>({ item: '', quantity: '', quality: '', lastUpdated: '' });
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [refreshKey])

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
        <button
          className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700"
          onClick={() => setAddModalOpen(true)}
        >
          Agregar Inventario
        </button>
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
        pendingEdit={modalType === 'edit' ? pendingEdit : undefined}
        onCancel={() => {
          setModalOpen(false);
          setModalType(null);
          setSelectedItem(null);
          setPendingEdit(null);
        }}
        onConfirm={async () => {
          if (modalType === 'delete') {
            if (selectedItem && selectedItem.item) {
              try {
                await removeInventoryItem(selectedItem);
                setInventory(inv => inv.filter(item => item.id !== selectedItem.id));
              } catch (err) {
                setError('Error eliminando el artículo.');
              }
            }
          } else if (modalType === 'edit' && pendingEdit && selectedItem) {
            try {
              const originalIdx = inventory.findIndex(item => item.id === selectedItem.id);
              if (originalIdx === -1) throw new Error('No se encontró el artículo original.');
              const originalItem = inventory[originalIdx];
              const updatedItem: InventoryItem = {
                ...originalItem,
                [pendingEdit.colKey]: pendingEdit.value,
              };
              await updateInventoryItem(updatedItem);
              setInventory(inv =>
                inv.map((row, idx) =>
                  idx === originalIdx ? updatedItem : row
                )
              );
            } catch (err) {
              setError('Error editando el artículo.');
            }
          }
          setModalOpen(false);
          setModalType(null);
          setSelectedItem(null);
          setPendingEdit(null);
        }}
        confirmLabel={modalType === 'delete' ? 'Eliminar' : 'Editar'}
        cancelLabel="Cancelar"
      />
      {addModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4 text-rose-700">Agregar nuevo artículo</h3>
            <form
              onSubmit={async e => {
                e.preventDefault();
                try {
                  await addInventoryItem({
                    item: newItem.item,
                    quantity: Number(newItem.quantity),
                    quality: newItem.quality,
                    lastUpdated: new Date().toISOString(),
                  });
                  setAddModalOpen(false);
                  setNewItem({ item: '', quantity: '', quality: '', lastUpdated: '' });
                  setRefreshKey(k => k + 1); // trigger inventory refresh
                } catch (err) {
                  setError('Error agregando el artículo.');
                }
              }}
              className="flex flex-col gap-3"
            >
              <input
                className="border border-rose-200 rounded px-3 py-2"
                placeholder="Nombre de Articulo"
                value={newItem.item}
                onChange={e => setNewItem({ ...newItem, item: e.target.value })}
                required
              />
              <input
                className="border border-rose-200 rounded px-3 py-2"
                placeholder="Cantidad"
                type="number"
                min="0"
                value={newItem.quantity}
                onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                required
              />
              <select
                className="border border-rose-200 rounded px-3 py-2"
                value={newItem.quality}
                onChange={e => setNewItem({ ...newItem, quality: e.target.value })}
                required
              >
                <option value="">Selecciona calidad</option>
                <option value="special">Especial</option>
                <option value="regular">Regular</option>
              </select>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryTab
