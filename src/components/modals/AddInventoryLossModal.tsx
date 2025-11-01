import { useState } from "react";
import type { InventoryLoss } from "../../shared/models/inventory";

interface AddInventoryLossModalProps {
    itemOptions: string[];
    inventoryQualityTypes: string[];
    open: boolean;
    onCancel: () => void;
    onConfirm: (loss: InventoryLoss) => void;
    onError: (error: unknown) => void;
}

export const AddInventoryLossModal = ({ itemOptions, inventoryQualityTypes, open, onCancel, onConfirm, onError }: AddInventoryLossModalProps) => {

    const [newLoss, setNewLoss] = useState<InventoryLoss>({ item: '', quality: '', quantity: 0, timestamp: new Date().toISOString() });

    const handleSubmitInventoryLoss = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await onConfirm(newLoss);
            onCancel();
            setNewLoss({ item: '', quality: '', quantity: 0, timestamp: new Date().toISOString() });
        } catch (err) {
            onError(err);
        }
    };

    const handleCancel = () => {
        onCancel();
        setNewLoss({ item: '', quality: '', quantity: 0, timestamp: new Date().toISOString() });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
                <h3 className="text-lg font-semibold mb-4 text-rose-700">Registrar Pérdida</h3>
                <form
                    onSubmit={handleSubmitInventoryLoss}
                    className="flex flex-col gap-3"
                >
                    <input
                        className="border border-rose-200 rounded px-3 py-2"
                        list="itemOptionsList"
                        placeholder="Selecciona artículo"
                        value={newLoss.item}
                        onChange={e => setNewLoss({ ...newLoss, item: e.target.value })}
                        required
                    />
                    <datalist id="itemOptionsList">
                        {itemOptions.map(item => (
                            <option key={item} value={item} />
                        ))}
                    </datalist>
                    <select
                        className="border border-rose-200 rounded px-3 py-2"
                        value={newLoss.quality}
                        onChange={e => setNewLoss({ ...newLoss, quality: e.target.value })}
                        required
                    >
                        <option value="">Selecciona calidad</option>
                        {inventoryQualityTypes.map(q => (
                            <option key={q} value={q}>{q}</option>
                        ))}
                    </select>
                    <input
                        className="border border-rose-200 rounded px-3 py-2"
                        placeholder="Cantidad"
                        type="number"
                        min="1"
                        value={newLoss.quantity.toString()}
                        onChange={e => setNewLoss({ ...newLoss, quantity: Number(e.target.value) })}
                        required
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                            onClick={handleCancel}
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
    );
};
