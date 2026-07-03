'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';

interface CityOpt {
    ref: string;
    name: string;
    area: string;
}

interface WhOpt {
    ref: string;
    number: string;
    description: string;
    type: string;
}

export interface ShippingValue {
    cityRef: string;
    cityName: string;
    warehouseRef: string;
    warehouse: string;
}

// Client-side cache so re-typing a query already fetched this session
// (e.g. backspacing then retyping) costs zero network calls.
const cityCache = new Map<string, CityOpt[]>();
const warehouseCache = new Map<string, WhOpt[]>();

function useDebounced<T>(value: T, delay = 280): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

const labelCls = 'font-display font-medium text-[13px] tracking-wide uppercase text-ink-soft';

const triggerCls =
    'font-body text-[16px] text-left bg-card rounded min-h-[48px] w-full px-3.5 py-2.5 ' +
    'border-[1.5px] border-line transition ' +
    'focus:outline-none focus:border-green-600 focus:shadow-[0_0_0_3px_rgba(46,70,49,0.12)] ' +
    'disabled:cursor-not-allowed disabled:opacity-50';

/* Shared picker dialog: search input pinned at top, big scrollable rows below. */
function PickerDialog({
                          open,
                          onOpenChange,
                          title,
                          placeholder,
                          query,
                          onQueryChange,
                          loading,
                          children,
                      }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    title: string;
    placeholder: string;
    query: string;
    onQueryChange: (v: string) => void;
    loading: boolean;
    children: React.ReactNode;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            const t = setTimeout(() => inputRef.current?.focus(), 60);
            return () => clearTimeout(t);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0 flex flex-col w-[calc(100%-1.25rem)] sm:max-w-[440px] h-[82vh] max-h-[640px] overflow-hidden">
                <div className="px-4 pt-4 pb-3 border-b border-line shrink-0">
                    <DialogTitle className="mb-2.5">{title}</DialogTitle>
                    <div className="relative">
                        <Search
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
                            width={17}
                            height={17}
                            strokeWidth={1.7}
                        />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => onQueryChange(e.target.value)}
                            placeholder={placeholder}
                            autoComplete="off"
                            className="w-full bg-card border-[1.5px] border-line rounded-full pl-10 pr-3.5 py-2.5 text-[16px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-green-600 focus:shadow-[0_0_0_3px_rgba(46,70,49,0.12)]"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {loading ? (
                        <p className="px-4 py-8 text-center text-[14px] text-ink-faint">Пошук…</p>
                    ) : (
                        children
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function CityPickerDialog({
                              open,
                              onOpenChange,
                              onPick,
                          }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onPick: (c: CityOpt) => void;
}) {
    const [query, setQuery] = useState('');
    const [opts, setOpts] = useState<CityOpt[]>([]);
    const [loading, setLoading] = useState(false);
    const debounced = useDebounced(query, 280);

    useEffect(() => {
        if (open) {
            setQuery('');
            setOpts([]);
        }
    }, [open]);

    useEffect(() => {
        const q = debounced.trim().toLowerCase();
        if (q.length < 2) {
            setOpts([]);
            return;
        }

        const cached = cityCache.get(q);
        if (cached) {
            setOpts(cached);
            return;
        }

        let cancelled = false;
        setLoading(true);
        fetch('/api/np/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q }),
        })
            .then((r) => r.json())
            .then((data) => {
                const items: CityOpt[] = data?.items ?? [];
                cityCache.set(q, items);
                if (!cancelled) setOpts(items);
            })
            .catch(() => {
                if (!cancelled) setOpts([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [debounced]);

    return (
        <PickerDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Оберіть місто"
            placeholder="Почніть вводити назву міста"
            query={query}
            onQueryChange={setQuery}
            loading={loading}
        >
            {query.trim().length < 2 ? (
                <p className="px-4 py-8 text-center text-[14px] text-ink-faint">Введіть щонайменше 2 символи</p>
            ) : opts.length === 0 ? (
                <p className="px-4 py-8 text-center text-[14px] text-ink-faint">Місто не знайдено</p>
            ) : (
                <ul>
                    {opts.map((c) => (
                        <li key={c.ref}>
                            <button
                                type="button"
                                onClick={() => onPick(c)}
                                className="w-full text-left px-4 py-3.5 min-h-[58px] flex flex-col justify-center border-b border-line-soft active:bg-green-tint hover:bg-green-tint transition-colors"
                            >
                                <span className="text-[16px] text-ink font-display font-medium">{c.name}</span>
                                {c.area ? <span className="text-[13px] text-ink-faint mt-0.5">{c.area}</span> : null}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </PickerDialog>
    );
}

function WarehousePickerDialog({
                                   open,
                                   onOpenChange,
                                   cityRef,
                                   onPick,
                               }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    cityRef: string;
    onPick: (w: WhOpt) => void;
}) {
    const [query, setQuery] = useState('');
    const [opts, setOpts] = useState<WhOpt[]>([]);
    const [loading, setLoading] = useState(false);
    const debounced = useDebounced(query, 250);

    useEffect(() => {
        if (open) setQuery('');
    }, [open]);

    useEffect(() => {
        if (!open || !cityRef) return;

        const q = debounced.trim().toLowerCase();
        const cacheKey = `${cityRef}::${q}`;
        const cached = warehouseCache.get(cacheKey);
        if (cached) {
            setOpts(cached);
            return;
        }

        let cancelled = false;
        setLoading(true);
        fetch('/api/np/warehouses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cityRef, q }),
        })
            .then((r) => r.json())
            .then((data) => {
                const items: WhOpt[] = data?.items ?? [];
                warehouseCache.set(cacheKey, items);
                if (!cancelled) setOpts(items);
            })
            .catch(() => {
                if (!cancelled) setOpts([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open, cityRef, debounced]);

    return (
        <PickerDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Оберіть відділення"
            placeholder="Номер або вулиця"
            query={query}
            onQueryChange={setQuery}
            loading={loading}
        >
            {opts.length === 0 ? (
                <p className="px-4 py-8 text-center text-[14px] text-ink-faint">Відділень не знайдено</p>
            ) : (
                <ul>
                    {opts.map((w) => (
                        <li key={w.ref}>
                            <button
                                type="button"
                                onClick={() => onPick(w)}
                                className="w-full text-left px-4 py-3.5 min-h-[58px] flex items-center border-b border-line-soft active:bg-green-tint hover:bg-green-tint transition-colors"
                            >
                                <span className="text-[15px] text-ink leading-snug">{w.description}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </PickerDialog>
    );
}

export function ShippingSelector({
                                     value = { cityRef: '', cityName: '', warehouseRef: '', warehouse: '' },
                                     showWarehouse,
                                     onChange,
                                 }: {
    value?: ShippingValue;
    showWarehouse: boolean;
    onChange: (patch: Partial<ShippingValue>) => void;
}) {
    const [cityOpen, setCityOpen] = useState(false);
    const [whOpen, setWhOpen] = useState(false);

    return (
        <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
        <span className={labelCls}>
          Місто <span className="text-amber-deep">*</span>
        </span>
                <button type="button" onClick={() => setCityOpen(true)} className={triggerCls}>
                    {value.cityName ? (
                        <span className="text-ink">{value.cityName}</span>
                    ) : (
                        <span className="text-ink-faint">Оберіть місто</span>
                    )}
                </button>
            </div>

            {showWarehouse ? (
                <div className="flex flex-col gap-1.5">
          <span className={labelCls}>
            Відділення / поштомат <span className="text-amber-deep">*</span>
          </span>
                    <button
                        type="button"
                        disabled={!value.cityRef}
                        onClick={() => setWhOpen(true)}
                        className={triggerCls}
                    >
                        {value.warehouse ? (
                            <span className="text-ink">{value.warehouse}</span>
                        ) : (
                            <span className="text-ink-faint">
                {value.cityRef ? 'Оберіть відділення' : 'Спочатку оберіть місто'}
              </span>
                        )}
                    </button>
                </div>
            ) : null}

            <CityPickerDialog
                open={cityOpen}
                onOpenChange={setCityOpen}
                onPick={(c) => {
                    const label = c.area ? `${c.name}, ${c.area}` : c.name;
                    onChange({ cityRef: c.ref, cityName: label, warehouseRef: '', warehouse: '' });
                    setCityOpen(false);
                }}
            />

            {showWarehouse ? (
                <WarehousePickerDialog
                    open={whOpen}
                    onOpenChange={setWhOpen}
                    cityRef={value.cityRef}
                    onPick={(w) => {
                        onChange({ warehouseRef: w.ref, warehouse: w.description });
                        setWhOpen(false);
                    }}
                />
            ) : null}
        </div>
    );
}