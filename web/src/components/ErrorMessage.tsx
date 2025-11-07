interface ErrorMessageProps {
    error: string;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
    return (
        <div className="text-destructive font-semibold">{error}</div>
    )
}