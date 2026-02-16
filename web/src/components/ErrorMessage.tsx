import { cn } from '@/lib/utils';

interface ErrorMessageProps {
    error: string;
    className?: string;
}

export function ErrorMessage({ error, className }: ErrorMessageProps) {
    return (
        <div className={cn("text-destructive font-semibold", className)}>{error}</div>
    )
}