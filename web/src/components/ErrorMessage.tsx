interface ErrorMessageProps {
    error: string;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
    return (
        <div className="text-red-600 font-semibold">{error}</div>
    )
}