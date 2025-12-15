import { useState } from 'react';
import { useParseTransaction } from '@/hooks/queries/ai';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ParseTransactionResponse } from '@/lib/api/types';

interface AiTransactionInputProps {
  onParseSuccess: (result: ParseTransactionResponse) => void;
  onParseError?: (error: Error) => void;
  disabled?: boolean;
}

export function AiTransactionInput({
  onParseSuccess,
  onParseError,
  disabled = false,
}: AiTransactionInputProps) {
  const [prompt, setPrompt] = useState('');
  const parseMutation = useParseTransaction();

  const handleParse = async () => {
    if (!prompt.trim()) return;

    try {
      const result = await parseMutation.mutateAsync({ prompt, language: 'es' });
      onParseSuccess(result);
      setPrompt('');
    } catch (error) {
      onParseError?.(error as Error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleParse();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          IA
        </Badge>
        <span className="text-sm text-muted-foreground">
          Describe la venta en lenguaje natural
        </span>
      </div>

      <textarea
        className="w-full border border-border rounded-lg px-3 py-2 bg-background min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
        placeholder='Ej: "1 ramo 12 rosas total $20.00 transferencia mila"'
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || parseMutation.isPending}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Ctrl + Enter para procesar
        </span>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleParse}
          disabled={disabled || parseMutation.isPending || !prompt.trim()}
        >
          {parseMutation.isPending ? (
            <>
              <span className="animate-spin mr-2">...</span>
              Procesando
            </>
          ) : (
            'Procesar con IA'
          )}
        </Button>
      </div>

      {parseMutation.isError && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          Error: {(parseMutation.error as Error).message}
        </div>
      )}
    </div>
  );
}
