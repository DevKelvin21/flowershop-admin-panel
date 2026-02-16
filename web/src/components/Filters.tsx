import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import type { DateRange } from 'react-day-picker';

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
    value?: V;
    onChange: (value: V) => void;
    options: SelectOption<V>[];
    placeholder?: string;
    selectProps?: Omit<React.ComponentProps<typeof Select>, 'value' | 'defaultValue' | 'onValueChange'>;
    triggerProps?: React.ComponentPropsWithoutRef<typeof SelectTrigger>;
    contentProps?: React.ComponentPropsWithoutRef<typeof SelectContent>;
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
        buttonProps?: React.ComponentProps<typeof Button>;
        popoverProps?: React.ComponentProps<typeof Popover>;
    };
}

const DATE_DISPLAY_FORMAT: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
};

function parseDate(value?: string) {
    if (!value) return undefined;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateInput(date?: Date) {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateLabel(date?: Date) {
    if (!date) return undefined;
    return date.toLocaleDateString(undefined, DATE_DISPLAY_FORMAT);
}

export function Filters({
    className,
    search,
    selects,
    dateRange,
}: FiltersProps) {
    const dateRangeValue = dateRange?.value;
    const dateRangeOnChange = dateRange?.onChange;

    const selectedDateRange = React.useMemo<DateRange | undefined>(() => {
        if (!dateRangeValue) return undefined;
        const from = parseDate(dateRangeValue.from);
        const to = parseDate(dateRangeValue.to);
        if (!from && !to) return undefined;
        return { from: from ?? undefined, to: to ?? undefined };
    }, [dateRangeValue]);

    const handleDateRangeChange = React.useCallback(
        (next?: DateRange) => {
            if (!dateRangeOnChange) return;
            dateRangeOnChange({
                from: formatDateInput(next?.from),
                to: formatDateInput(next?.to),
            });
        },
        [dateRangeOnChange]
    );

    const dateRangeLabel = React.useMemo(() => {
        if (!dateRangeValue) return 'Seleccionar rango';
        const from = formatDateLabel(parseDate(dateRangeValue.from));
        const to = formatDateLabel(parseDate(dateRangeValue.to));

        if (from && to) return `${from} - ${to}`;
        if (from) return `${from} - ${dateRange?.toPlaceholder ?? '...'}`;
        if (to) return `${dateRange?.fromPlaceholder ?? '...'} - ${to}`;
        return `${dateRange?.fromPlaceholder ?? '...'} - ${dateRange?.toPlaceholder ?? '...'}`;
    }, [dateRangeValue, dateRange?.fromPlaceholder, dateRange?.toPlaceholder]);

    const searchInputProps = search?.inputProps;
    const searchInputClassName = searchInputProps?.className;
    const searchInputType = searchInputProps?.type;
    const searchInputRest = React.useMemo(() => {
        if (!searchInputProps) return undefined;
        const rest = { ...searchInputProps } as React.InputHTMLAttributes<HTMLInputElement>;
        delete rest.className;
        delete rest.type;
        delete rest.value;
        delete rest.onChange;
        return rest;
    }, [searchInputProps]);

    const {
        className: dateRangeButtonClassName,
        variant: dateRangeButtonVariant,
        ...dateRangeButtonRest
    } = dateRange?.buttonProps ?? {};

    return (
        <div className={cn('mb-4 flex flex-wrap gap-2 rounded-xl border border-border/70 bg-card/70 p-3 shadow-sm', className)}>
            {search && (
                <Input
                    type={searchInputType ?? 'text'}
                    className={cn('flex-1 min-w-[220px]', searchInputClassName)}
                    placeholder={search.placeholder ?? 'Buscar...'}
                    value={search.value}
                    onChange={e => search.onChange(e.target.value)}
                    {...(searchInputRest ?? {})}
                />
            )}
            {selects?.map((config) => {
                const { key, value, onChange, options, placeholder, selectProps, triggerProps, contentProps } = config;
                const { className: triggerClassName, ...restTriggerProps } = triggerProps ?? {};
                const { className: contentClassName, ...restContentProps } = contentProps ?? {};

                return (
                    <Select
                        key={key}
                        value={value ?? undefined}
                        onValueChange={onChange as (nextValue: string) => void}
                        {...(selectProps ?? {})}
                    >
                        <SelectTrigger
                            className={cn('min-w-[12rem]', triggerClassName)}
                            {...restTriggerProps}
                        >
                            <SelectValue placeholder={placeholder ?? 'Seleccionar'} />
                        </SelectTrigger>
                        <SelectContent
                            className={cn(contentClassName)}
                            {...restContentProps}
                        >
                            {options.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            })}
            {dateRange && (
                <Popover {...(dateRange.popoverProps ?? {})}>
                    <PopoverTrigger asChild>
                        <Button
                            variant={dateRangeButtonVariant ?? 'outline'}
                            className={cn('min-w-[16rem] justify-start gap-2', dateRangeButtonClassName)}
                            {...dateRangeButtonRest}
                        >
                            <FontAwesomeIcon icon={faCalendarDays} className="size-4" />
                            <span className="truncate">
                                {dateRangeLabel}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={selectedDateRange}
                            onSelect={handleDateRangeChange}
                            numberOfMonths={1}
                            initialFocus
                            defaultMonth={selectedDateRange?.from ?? selectedDateRange?.to}
                        />
                    </PopoverContent>
                </Popover>
            )}
        </div>
    )
}

export type { SelectConfig, SelectOption };
