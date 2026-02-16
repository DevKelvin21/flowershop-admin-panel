import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

interface EditableTableProps<T extends Record<string, unknown>> {
    data: T[];
    columns: { key: Extract<keyof T, string>, label: string }[];
    onChange: (rowIdx: number, colKey: Extract<keyof T, string>, value: string) => void;
    onDelete: (rowIdx: number) => void;
}

export function EditableTable<T extends Record<string, unknown>>({ 
    data, 
    columns, 
    onChange, 
    onDelete 
}: EditableTableProps<T>) {
    const [editing, setEditing] = useState<{ row: number, col: Extract<keyof T, string> } | null>(null)
    const [editValue, setEditValue] = useState('')

    return (
        <div className="overflow-x-auto rounded-xl border border-border/70 bg-card shadow-sm">
            <table className="min-w-full text-card-foreground">
                <thead className="bg-muted/70">
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} className="px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-muted-foreground">{col.label}</th>
                        ))}
                        <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-muted-foreground">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-t border-border/50 transition-colors even:bg-muted/20 hover:bg-muted/40">
                            {columns.map(col => (
                                <td
                                    key={col.key}
                                    className="cursor-pointer px-4 py-3"
                                    onClick={() => {
                                        setEditing({ row: rowIdx, col: col.key })
                                        setEditValue(String((row as Record<string, unknown>)[col.key] ?? ''))
                                    }}
                                >
                                    {editing && editing.row === rowIdx && editing.col === col.key ? (
                                        <input
                                            className="w-full rounded border border-border bg-background px-2 py-1 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                                            value={editValue}
                                            autoFocus
                                            onChange={e => setEditValue(e.target.value)}
                                            onBlur={() => {
                                                onChange(rowIdx, col.key, editValue)
                                                setEditing(null)
                                            }}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    onChange(rowIdx, col.key, editValue)
                                                    setEditing(null)
                                                }
                                            }}
                                        />
                                    ) : (
                                        String((row as Record<string, unknown>)[col.key] ?? '')
                                    )}
                                </td>
                            ))}
                            <td className="px-4 py-3">
                                <button
                                    className="rounded bg-destructive px-3 py-1 text-destructive-foreground transition-colors hover:bg-destructive/90"
                                    onClick={() => onDelete(rowIdx)}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
