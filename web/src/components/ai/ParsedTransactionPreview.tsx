import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ParseTransactionResponse } from '@/lib/api/types';

interface ParsedTransactionPreviewProps {
  result: ParseTransactionResponse;
  onAccept: () => void;
  onReject: () => void;
}

export function ParsedTransactionPreview({
  result,
  onAccept,
  onReject,
}: ParsedTransactionPreviewProps) {
  const confidenceColor =
    result.confidence >= 0.8
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : result.confidence >= 0.5
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);

  const paymentMethodLabel =
    result.paymentMethod === 'BANK_TRANSFER' ? 'Transferencia' : 'Efectivo';

  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Resultado del analisis IA</h4>
        <Badge className={confidenceColor}>
          Confianza: {Math.round(result.confidence * 100)}%
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Tipo:</span>
          <span className="ml-2 font-medium">
            {result.type === 'SALE' ? 'Venta' : 'Gasto'}
          </span>
        </div>
        {result.salesAgent && (
          <div>
            <span className="text-muted-foreground">Agente:</span>
            <span className="ml-2 font-medium capitalize">{result.salesAgent}</span>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">Pago:</span>
          <span className="ml-2 font-medium">{paymentMethodLabel}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Total:</span>
          <span className="ml-2 font-medium text-primary">
            {formatCurrency(result.totalAmount)}
          </span>
        </div>
      </div>

      {result.items.length > 0 && (
        <div>
          <span className="text-sm text-muted-foreground">Articulos:</span>
          <ul className="mt-1 space-y-1">
            {result.items.map((item, idx) => (
              <li key={idx} className="text-sm flex justify-between">
                <span>
                  {item.quantity}x {item.itemName} ({item.quality})
                </span>
                <span className="text-muted-foreground">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.notes && (
        <div className="text-sm">
          <span className="text-muted-foreground">Notas:</span>
          <span className="ml-2">{result.notes}</span>
        </div>
      )}

      {result.suggestions && result.suggestions.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Sugerencias:
          </span>
          <ul className="mt-1 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
            {result.suggestions.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onReject}>
          Cancelar
        </Button>
        <Button size="sm" onClick={onAccept}>
          Usar estos datos
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-right">
        Procesado en {result.processingTimeMs}ms
      </div>
    </div>
  );
}
