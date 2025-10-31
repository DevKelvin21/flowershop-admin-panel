import React from 'react';

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

export function Filters({
    className,
    search,
    selects,
}: {
    className?: string;
    search?: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
        inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    };
    selects?: SelectConfig<string>[];
}) {
    return (
        <div className={"flex gap-2 mb-4" + (className ? ` ${className}` : '')}>
            {search && (
                <input
                    type="text"
                    className="px-3 py-2 border border-rose-200 rounded w-full focus:ring-2 focus:ring-rose-400"
                    placeholder={search.placeholder ?? 'Buscar...'}
                    value={search.value}
                    onChange={e => search.onChange(e.target.value)}
                    {...(search.inputProps ?? {})}
                />
            )}
            {selects?.map(({ key, value, onChange, options, placeholder, selectProps }) => (
                <select
                    key={key}
                    className="px-3 py-2 border border-rose-200 rounded focus:ring-2 focus:ring-rose-400"
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
        </div>
    )
}

export type { SelectOption, SelectConfig };