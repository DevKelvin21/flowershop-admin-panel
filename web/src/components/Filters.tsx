import React from 'react';

type DateRangeValue = {
    from?: string;
    to?: string;
};

type SelectOption<V extends string = string> = {
    value: V;
    label: string;
};

type SelectConfig<V extends string = string> = {
    key: string;
    value: V;
    onChange: (value: V) => void;
    options: SelectOption<V>[];
    placeholder?: string;
    selectProps?: React.SelectHTMLAttributes<HTMLSelectElement>;
};

interface FiltersProps {
    className?: string;
    search?: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
        inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    };
    selects?: SelectConfig<string>[];
    dateRange?: {
        value: DateRangeValue;
        onChange: (next: DateRangeValue) => void;
        fromPlaceholder?: string;
        toPlaceholder?: string;
        fromInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
        toInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    };
}

export function Filters({
    className,
    search,
    selects,
    dateRange,
}: FiltersProps) {
    return (
        <div className={"flex gap-2 mb-4" + (className ? ` ${className}` : '')}>
            {search && (
                <input
                    type="text"
                    className="px-3 py-2 border border-border rounded bg-background text-foreground w-full focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                    placeholder={search.placeholder ?? 'Buscar...'}
                    value={search.value}
                    onChange={e => search.onChange(e.target.value)}
                    {...(search.inputProps ?? {})}
                />
            )}
            {selects?.map(({ key, value, onChange, options, placeholder, selectProps }) => (
                <select
                    key={key}
                    className="px-3 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    {...(selectProps ?? {})}
                >
                    {placeholder && (
                        <option value="">{placeholder}</option>
                    )}
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ))}
            {dateRange && (
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        className="px-3 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                        placeholder={dateRange.fromPlaceholder ?? 'From'}
                        value={dateRange.value.from ?? ''}
                        max={dateRange.value.to || undefined}
                        onChange={e =>
                            dateRange.onChange({
                                ...dateRange.value,
                                from: e.target.value || undefined,
                            })
                        }
                        {...(dateRange.fromInputProps ?? {})}
                    />
                    <span className="text-muted-foreground">—</span>
                    <input
                        type="date"
                        className="px-3 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                        placeholder={dateRange.toPlaceholder ?? 'To'}
                        value={dateRange.value.to ?? ''}
                        min={dateRange.value.from || undefined}
                        onChange={e =>
                            dateRange.onChange({
                                ...dateRange.value,
                                to: e.target.value || undefined,
                            })
                        }
                        {...(dateRange.toInputProps ?? {})}
                    />
                </div>
            )}
        </div>
    )
}

export type { SelectOption, SelectConfig };