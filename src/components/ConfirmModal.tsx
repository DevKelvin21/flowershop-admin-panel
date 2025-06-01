import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  item: any;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  item,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
        <h3 className="text-lg font-semibold mb-2 text-rose-700">{title}</h3>
        <p className="mb-4 text-gray-700">{message}</p>
        <div className="mb-4 text-sm text-gray-600">
          <div><b>Artículo:</b> {item?.item}</div>
          <div><b>Cantidad:</b> {item?.quantity}</div>
          <div><b>Calidad:</b> {item?.quality}</div>
          {item?.lastUpdated && <div><b>Última Actualización:</b> {String(item.lastUpdated)}</div>}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold"
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
