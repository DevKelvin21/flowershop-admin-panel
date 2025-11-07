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
        <table className="min-w-full border border-border rounded-lg overflow-hidden bg-card text-card-foreground">
            <thead className="bg-muted">
                <tr>
                    {columns.map(col => (
                        <th key={col.key} className="px-4 py-2 text-left font-semibold text-primary">{col.label}</th>
                    ))}
                    <th className="px-4 py-2 text-left font-semibold text-primary">Eliminar</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIdx) => (
                    <tr key={rowIdx} className="even:bg-muted/50">
                        {columns.map(col => (
                            <td
                                key={col.key}
                                className="px-4 py-2 cursor-pointer"
                                onClick={() => {
                                    setEditing({ row: rowIdx, col: col.key })
                                    setEditValue(String((row as Record<string, unknown>)[col.key] ?? ''))
                                }}
                            >
                                {editing && editing.row === rowIdx && editing.col === col.key ? (
                                    <input
                                        className="border border-border rounded px-2 py-1 w-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
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
                        <td className="px-4 py-2">
                            <button
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1 rounded"
                                onClick={() => onDelete(rowIdx)}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}