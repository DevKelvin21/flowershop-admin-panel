import { createFileRoute } from '@tanstack/react-router';
import { FinancialContainer } from '@/pages/Financial/FinancialContainer';

export const Route = createFileRoute('/_authenticated/financial')({
  component: FinancialContainer,
});
