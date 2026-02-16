import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InventoryModalFrameProps {
  open: boolean;
  titleId: string;
  children: ReactNode;
}

interface InventoryModalHeaderProps {
  title: string;
  description?: string;
  titleId: string;
}

interface InventoryModalBodyProps {
  children: ReactNode;
}

interface InventoryModalFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}

interface InventoryModalFooterProps {
  formId: string;
  onCancel: () => void;
  submitLabel: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
}

function InventoryModalFrame({
  open,
  titleId,
  children,
}: InventoryModalFrameProps) {
  if (!open) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/55 p-4 backdrop-blur-sm">
      <div className="flex min-h-full items-start justify-center py-6 sm:items-center sm:py-10">
        <section
          aria-labelledby={titleId}
          aria-modal="true"
          className="w-full max-w-lg rounded-2xl border border-border/70 bg-card p-6 text-card-foreground shadow-xl"
          role="dialog"
        >
          {children}
        </section>
      </div>
    </div>,
    document.body,
  );
}

function InventoryModalHeader({
  title,
  description,
  titleId,
}: InventoryModalHeaderProps) {
  return (
    <header className="space-y-1">
      <h3 className="text-lg font-semibold text-primary" id={titleId}>
        {title}
      </h3>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}

function InventoryModalBody({ children }: InventoryModalBodyProps) {
  return <div className="mt-5 space-y-4">{children}</div>;
}

function InventoryModalField({
  label,
  htmlFor,
  hint,
  children,
}: InventoryModalFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function InventoryModalFooter({
  formId,
  onCancel,
  submitLabel,
  cancelLabel = 'Cancelar',
  isSubmitting = false,
  submitDisabled = false,
}: InventoryModalFooterProps) {
  return (
    <footer className="mt-6 flex justify-end gap-2 border-t border-border/60 pt-4">
      <Button
        onClick={onCancel}
        type="button"
        variant="outline"
        disabled={isSubmitting}
      >
        {cancelLabel}
      </Button>
      <Button
        className={cn(isSubmitting ? 'cursor-wait' : undefined)}
        form={formId}
        type="submit"
        disabled={isSubmitting || submitDisabled}
      >
        {isSubmitting ? 'Guardando...' : submitLabel}
      </Button>
    </footer>
  );
}

export const InventoryFormModal = Object.assign(InventoryModalFrame, {
  Frame: InventoryModalFrame,
  Header: InventoryModalHeader,
  Body: InventoryModalBody,
  Field: InventoryModalField,
  Footer: InventoryModalFooter,
});
