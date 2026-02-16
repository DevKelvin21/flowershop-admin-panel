import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/lib/api/endpoints';
import type { ParseTransactionRequest } from '@/lib/api/types';

export function useParseTransaction() {
  return useMutation({
    mutationFn: (data: ParseTransactionRequest) => aiApi.parseTransaction(data),
  });
}
