import { useState } from "react";
import type { NewInventoryItem } from '../../shared/models/inventory';
import { INVENTORY_QUALITIES } from '../../shared/constants/inventory';

interface AddInventoryModalProps {
    open: boolean;
    onCancel: () => void;
    onConfirm: (item: NewInventoryItem) => void;
    onError: (error: unknown) => void;
}

export function AddInventoryModal({ open, onCancel, onConfirm, onError }: AddInventoryModalProps) {
    const [formData, setFormData] = useState<NewInventoryItem>({
        item: '',
        quantity: 0,
        quality: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onConfirm(formData);
            setFormData({ item: '', quantity: 0, quality: '' });
            onCancel();
        } catch (err) {
            onError(err);
        }
    };

    if (!open) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50 backdrop-blur-sm">
            <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
                <h3 className="text-lg font-semibold mb-4 text-primary">Agregar nuevo artículo</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        className="border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                        placeholder="Nombre de Articulo"
                        value={formData.item}
                        onChange={e => setFormData({ ...formData, item: e.target.value })}
                    />
                    <input
                        className="border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                        placeholder="Cantidad"
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    />
                    <select
                        className="border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                        value={formData.quality}
                        onChange={e => setFormData({ ...formData, quality: e.target.value })}
                    >
                        <option value="">Selecciona calidad</option>
                        <option value={INVENTORY_QUALITIES.SPECIAL}>Especial</option>
                        <option value={INVENTORY_QUALITIES.REGULAR}>Regular</option>
                    </select>
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-muted hover:bg-muted/80 text-muted-foreground"
                            onClick={onCancel}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            Agregar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}