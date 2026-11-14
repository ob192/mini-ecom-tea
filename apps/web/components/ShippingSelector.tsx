'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

/*
  A failed lookup is not an empty one.

  Both pickers used to read `data.items ?? []` straight off the response, so a
  502 from Nova Poshta — or a dropped connection, or our own 60/min limiter —
  reached the customer as «Місто не знайдено»: we told them their city does not
  exist. Worse, that empty array was written into the cache above, so retyping
  the same letters replayed the lie for the rest of the visit, long after Nova
  Poshta had recovered. Throwing instead leaves the cache untouched and lets the
  dialog say what actually happened and offer a retry.
*/
async function npLookup<T>(url: string, body: unknown): Promise<T[]> {
    const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => null);
    if (!r.ok || data?.error || !Array.isArray(data?.items)) throw new Error('np_lookup_failed');
    return data.items as T[];
}

function useDebounced<T>(value: T, delay = 280): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

const labelCls = 'font-medium text-sm tracking-wide uppercase text-muted-foreground';

/*
  `data-invalid`, not `aria-invalid`: these triggers are plain buttons, and
  `aria-invalid` is only defined on widgets that take input — a screen reader
  ignores it on a button, and jsx-a11y rightly flags it. The error still reaches
  assistive technology through `aria-describedby` on the trigger and `role=alert`
  on the message; this attribute only carries the colour, so that the toast's
  «Перевірте виділені поля» has something highlighted to point at.
*/
const triggerCls =
    'text-base text-left bg-card rounded-md min-h-12 w-full px-3.5 py-2.5 ' +
    'border border-border transition ' +
    'focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-ring ' +
    'data-[invalid]:border-error data-[invalid]:bg-error-subtle ' +
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
                          failed,
                          onRetry,
                          children,
                      }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    title: string;
    placeholder: string;
    query: string;
    onQueryChange: (v: string) => void;
    loading: boolean;
    failed?: boolean;
    onRetry?: () => void;
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
            <DialogContent className="flex max-h-[85dvh] w-[calc(100%-1.25rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
                <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
                    <DialogTitle className="mb-2.5">{title}</DialogTitle>
                    <div className="relative">
                        <Search
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
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
                            className="w-full bg-background border border-border rounded-md pl-10 pr-3.5 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {loading ? (
                        <p className="px-4 py-8 text-center text-sm text-muted-foreground">Пошук…</p>
                    ) : failed ? (
                        <div className="px-4 py-8 text-center" role="alert">
                            <p className="text-sm text-muted-foreground text-pretty">
                                Не вдалося звʼязатися з Новою поштою. Перевірте інтернет і спробуйте ще раз.
                            </p>
                            <Button type="button" variant="secondary" size="sm" className="mt-3.5" onClick={onRetry}>
                                Спробувати ще раз
                            </Button>
                        </div>
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
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const debounced = useDebounced(query, 280);

    useEffect(() => {
        if (open) {
            setQuery('');
            setOpts([]);
            setFailed(false);
        }
    }, [open]);

    useEffect(() => {
        const q = debounced.trim().toLowerCase();
        if (q.length < 2) {
            setOpts([]);
            setFailed(false);
            return;
        }

        const cached = cityCache.get(q);
        if (cached) {
            setOpts(cached);
            setFailed(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setFailed(false);
        npLookup<CityOpt>('/api/np/cities', { q })
            .then((items) => {
                cityCache.set(q, items);
                if (!cancelled) setOpts(items);
            })
            .catch(() => {
                if (!cancelled) {
                    setOpts([]);
                    setFailed(true);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [debounced, attempt]);

    return (
        <PickerDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Оберіть місто"
            placeholder="Почніть вводити назву міста"
            query={query}
            onQueryChange={setQuery}
            loading={loading}
            failed={failed}
            onRetry={() => setAttempt((n) => n + 1)}
        >
            {query.trim().length < 2 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">Введіть щонайменше 2 символи</p>
            ) : opts.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">Місто не знайдено</p>
            ) : (
                <ul>
                    {opts.map((c) => (
                        <li key={c.ref}>
                            <button
                                type="button"
                                onClick={() => onPick(c)}
                                className="w-full text-left px-4 py-3.5 min-h-14 flex flex-col justify-center border-b border-border active:bg-foreground/10 hover:bg-foreground/5 transition-colors"
                            >
                                <span className="text-base text-foreground font-medium">{c.name}</span>
                                {c.area ? <span className="text-sm text-muted-foreground mt-0.5">{c.area}</span> : null}
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
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const debounced = useDebounced(query, 250);

    useEffect(() => {
        if (open) {
            setQuery('');
            setFailed(false);
        }
    }, [open]);

    useEffect(() => {
        if (!open || !cityRef) return;

        const q = debounced.trim().toLowerCase();
        const cacheKey = `${cityRef}::${q}`;
        const cached = warehouseCache.get(cacheKey);
        if (cached) {
            setOpts(cached);
            setFailed(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setFailed(false);
        npLookup<WhOpt>('/api/np/warehouses', { cityRef, q })
            .then((items) => {
                warehouseCache.set(cacheKey, items);
                if (!cancelled) setOpts(items);
            })
            .catch(() => {
                if (!cancelled) {
                    setOpts([]);
                    setFailed(true);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open, cityRef, debounced, attempt]);

    return (
        <PickerDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Оберіть відділення"
            placeholder="Номер або вулиця"
            query={query}
            onQueryChange={setQuery}
            loading={loading}
            failed={failed}
            onRetry={() => setAttempt((n) => n + 1)}
        >
            {opts.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">Відділень не знайдено</p>
            ) : (
                <ul>
                    {opts.map((w) => (
                        <li key={w.ref}>
                            <button
                                type="button"
                                onClick={() => onPick(w)}
                                className="w-full text-left px-4 py-3.5 min-h-14 flex items-center border-b border-border active:bg-foreground/10 hover:bg-foreground/5 transition-colors"
                            >
                                <span className="text-base text-foreground leading-snug">{w.description}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </PickerDialog>
    );
}

/*
  `cityError` / `warehouseError` are the form's own messages for these two
  fields, and they are not optional decoration.

  The schema has always required a city and (for a branch delivery) a warehouse,
  so `handleSubmit` refused to submit without them — but nothing on the page
  rendered those two messages. A customer who filled in their name and phone,
  missed the city picker and pressed «Підтвердити замовлення» got no error, no
  movement and no order: the button simply did nothing, on the last screen of
  the checkout. Every other field in this form reports itself through `Field` or
  `FormMessage`; these two are hand-built triggers, so they have to be handed
  their errors explicitly.
*/
export function ShippingSelector({
                                     value = { cityRef: '', cityName: '', warehouseRef: '', warehouse: '' },
                                     showWarehouse,
                                     onChange,
                                     cityError,
                                     warehouseError,
                                 }: {
    value?: ShippingValue;
    showWarehouse: boolean;
    onChange: (patch: Partial<ShippingValue>) => void;
    cityError?: string;
    warehouseError?: string;
}) {
    const [cityOpen, setCityOpen] = useState(false);
    const [whOpen, setWhOpen] = useState(false);
    const cityErrId = 'np-city-error';
    const whErrId = 'np-warehouse-error';

    return (
        <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
        <span className={labelCls}>
          Місто <span className="text-foreground">*</span>
        </span>
                <button
                    type="button"
                    onClick={() => setCityOpen(true)}
                    className={triggerCls}
                    data-invalid={cityError ? '' : undefined}
                    aria-describedby={cityError ? cityErrId : undefined}
                >
                    {value.cityName ? (
                        <span className="text-foreground">{value.cityName}</span>
                    ) : (
                        <span className="text-muted-foreground">Оберіть місто</span>
                    )}
                </button>
                {cityError ? (
                    <p id={cityErrId} role="alert" className="text-sm font-medium text-error-subtle-foreground">
                        {cityError}
                    </p>
                ) : null}
            </div>

            {showWarehouse ? (
                <div className="flex flex-col gap-1.5">
          <span className={labelCls}>
            Відділення / поштомат <span className="text-foreground">*</span>
          </span>
                    <button
                        type="button"
                        disabled={!value.cityRef}
                        onClick={() => setWhOpen(true)}
                        className={triggerCls}
                        data-invalid={warehouseError ? '' : undefined}
                        aria-describedby={warehouseError ? whErrId : undefined}
                    >
                        {value.warehouse ? (
                            <span className="text-foreground">{value.warehouse}</span>
                        ) : (
                            <span className="text-muted-foreground">
                {value.cityRef ? 'Оберіть відділення' : 'Спочатку оберіть місто'}
              </span>
                        )}
                    </button>
                    {warehouseError ? (
                        <p id={whErrId} role="alert" className="text-sm font-medium text-error-subtle-foreground">
                            {warehouseError}
                        </p>
                    ) : null}
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