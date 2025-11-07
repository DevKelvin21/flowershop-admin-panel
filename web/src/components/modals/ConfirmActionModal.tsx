import React from 'react';

interface ConfirmActionModalProps {
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

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
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
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50 backdrop-blur-sm">
      <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
        <h3 className="text-lg font-semibold mb-2 text-primary">{title}</h3>
        <p className="mb-4 text-foreground">{message}</p>
        <div className="mb-4">
          <div className="font-semibold mb-1">Detalles del artículo:</div>
          <ul className="text-sm text-muted-foreground">
            {Object.keys(fieldLabels).map(key => (
              <li key={key}>
                <span className="font-medium">{fieldLabels[key]}:</span> {item[key] ?? '-'}
              </li>
            ))}
          </ul>
        </div>
        {pendingEdit && (
          <div className="mb-4 bg-muted p-2 rounded">
            <div className="font-semibold mb-1 text-primary">Resumen de cambios:</div>
            <div className="text-sm">
              <span className="font-medium">{fieldLabels[pendingEdit.colKey] || pendingEdit.colKey}:</span>{' '}
              <span className="line-through text-destructive mr-2">{item[pendingEdit.colKey]}</span>
              <span className="text-secondary">{pendingEdit.value}</span>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded bg-muted hover:bg-muted/80 text-muted-foreground"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="px-4 py-2 rounded bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
