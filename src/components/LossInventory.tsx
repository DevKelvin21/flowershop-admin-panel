import { useState, useEffect } from 'react';
import { getInventoryLoss, addInventoryLoss, removeInventoryLoss, getInventory, type InventoryLoss, type InventoryItem } from '../db/utils';
import ConfirmModal from './ConfirmModal';

function LossInventory() {
  const [losses, setLosses] = useState<InventoryLoss[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newLoss, setNewLoss] = useState<{ item: string; quality: string; quantity: string; timestamp: string }>({ item: '', quality: '', quantity: '', timestamp: '' });
  const [filterDate, setFilterDate] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedLoss, setSelectedLoss] = useState<InventoryLoss | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [lossList, invList] = await Promise.all([
          getInventoryLoss(),
          getInventory()
        ]);
        setLosses(lossList);
        setInventory(invList);
      } catch (err: any) {
        setError(err?.message || 'Error cargando pérdidas o inventario');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredLosses = losses.filter(loss => {
    if (!filterDate) return true;
    return loss.timestamp.startsWith(filterDate);
  });

  const qualityOptions = ['special', 'regular'];
  const itemOptions = Array.from(new Set(inventory.map(i => i.item)));

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-rose-700">Pérdidas de Inventario</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="date"
          className="px-3 py-2 border border-rose-200 rounded focus:ring-2 focus:ring-rose-400"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700"
          onClick={() => setAddModalOpen(true)}
        >
          Agregar Pérdida
        </button>
      </div>
      <table className="min-w-full border border-rose-100 rounded-lg overflow-hidden">
        <thead className="bg-rose-50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-rose-800">Artículo</th>
            <th className="px-4 py-2 text-left font-semibold text-rose-800">Calidad</th>
            <th className="px-4 py-2 text-left font-semibold text-rose-800">Cantidad</th>
            <th className="px-4 py-2 text-left font-semibold text-rose-800">Fecha</th>
            <th className="px-4 py-2 text-left font-semibold text-rose-800">Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {filteredLosses.map(loss => (
            <tr key={loss.id} className="even:bg-rose-50">
              <td className="px-4 py-2">{loss.item}</td>
              <td className="px-4 py-2">{loss.quality}</td>
              <td className="px-4 py-2">{loss.quantity}</td>
              <td className="px-4 py-2">{loss.timestamp.slice(0, 10)}</td>
              <td className="px-4 py-2">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => { setSelectedLoss(loss); setConfirmOpen(true); }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {addModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4 text-rose-700">Registrar Pérdida</h3>
            <form
              onSubmit={async e => {
                e.preventDefault();
                try {
                  await addInventoryLoss({
                    item: newLoss.item,
                    quality: newLoss.quality,
                    quantity: Number(newLoss.quantity),
                    timestamp: new Date().toISOString(),
                  });
                  setAddModalOpen(false);
                  setNewLoss({ item: '', quality: '', quantity: '', timestamp: '' });
                  setLoading(true);
                  const [lossList, invList] = await Promise.all([
                    getInventoryLoss(),
                    getInventory()
                  ]);
                  setLosses(lossList);
                  setInventory(invList);
                } catch (err) {
                  setError('Error registrando la pérdida.');
                }
              }}
              className="flex flex-col gap-3"
            >
              <select
                className="border border-rose-200 rounded px-3 py-2"
                value={newLoss.item}
                onChange={e => setNewLoss({ ...newLoss, item: e.target.value })}
                required
              >
                <option value="">Selecciona artículo</option>
                {itemOptions.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <select
                className="border border-rose-200 rounded px-3 py-2"
                value={newLoss.quality}
                onChange={e => setNewLoss({ ...newLoss, quality: e.target.value })}
                required
              >
                <option value="">Selecciona calidad</option>
                {qualityOptions.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
              <input
                className="border border-rose-200 rounded px-3 py-2"
                placeholder="Cantidad"
                type="number"
                min="1"
                value={newLoss.quantity}
                onChange={e => setNewLoss({ ...newLoss, quantity: e.target.value })}
                required
              />
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
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirmOpen}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar esta pérdida? Esto restaurará la cantidad en inventario."
        item={selectedLoss}
        onCancel={() => { setConfirmOpen(false); setSelectedLoss(null); }}
        onConfirm={async () => {
          if (selectedLoss) {
            try {
              await removeInventoryLoss(selectedLoss);
              setConfirmOpen(false);
              setSelectedLoss(null);
              setLoading(true);
              const [lossList, invList] = await Promise.all([
                getInventoryLoss(),
                getInventory()
              ]);
              setLosses(lossList);
              setInventory(invList);
            } catch (err) {
              setError('Error eliminando la pérdida.');
            }
          }
        }}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
      />
      {loading && <div className="text-gray-500 mt-4">Cargando...</div>}
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
}

export default LossInventory;