import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  item: any;
  pendingEdit?: Omit<{ colKey: string; value: any; rowIdx?: number }, 'rowIdx'> | null;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const fieldLabels: Record<string, string> = {
  item: 'Nombre de Artículo',
  quantity: 'Cantidad',
  quality: 'Calidad',
  lastUpdated: 'Última Actualización',
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  item,
  pendingEdit,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
}) => {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
        <h3 className="text-lg font-semibold mb-2 text-rose-700">{title}</h3>
        <p className="mb-4 text-rose-900">{message}</p>
        <div className="mb-4">
          <div className="font-semibold mb-1">Detalles del artículo:</div>
          <ul className="text-sm text-rose-800">
            {Object.keys(fieldLabels).map(key => (
              <li key={key}>
                <span className="font-medium">{fieldLabels[key]}:</span> {item[key] ?? '-'}
              </li>
            ))}
          </ul>
        </div>
        {pendingEdit && (
          <div className="mb-4 bg-rose-50 p-2 rounded">
            <div className="font-semibold mb-1 text-rose-700">Resumen de cambios:</div>
            <div className="text-sm">
              <span className="font-medium">{fieldLabels[pendingEdit.colKey] || pendingEdit.colKey}:</span>{' '}
              <span className="line-through text-red-500 mr-2">{item[pendingEdit.colKey]}</span>
              <span className="text-green-700">{pendingEdit.value}</span>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
