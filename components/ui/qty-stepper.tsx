'use client';

import { Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';

/*
  QtyStepper — minus, the value, plus in one bordered box.

  Both hit areas are 44px (M1), which also makes the `default` size line up with
  the primary button beside it in the product page's buy row. The value is
  announced through `aria-live`, so a screen reader hears the new quantity after
  a press rather than only the button's label (A7).
*/
export function QtyStepper({
  value,
  onDec,
  onInc,
  min = 1,
  max = 99,
  size = 'default',
  className,
  label = 'Кількість',
}: {
  value: number;
  onDec: () => void;
  onInc: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'default';
  className?: string;
  label?: string;
}) {
  const sm = size === 'sm';
  const btn = cn(
    'grid place-items-center text-foreground transition-colors',
    'hover:bg-foreground/5 active:bg-foreground/10',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
    'disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent',
    sm ? 'size-9' : 'size-11',
  );
  const glyph = sm ? 'size-4' : 'size-5';

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'inline-flex items-center rounded-md border border-input bg-background',
        className,
      )}
    >
      <button
        type="button"
        onClick={onDec}
        disabled={value <= min}
        aria-label="Зменшити кількість"
        className={cn(btn, 'rounded-l-md')}
      >
        <Minus className={glyph} />
      </button>
      <span
        aria-live="polite"
        className={cn('text-center tabular-nums', sm ? 'w-7 text-sm' : 'w-9 text-base font-medium')}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onInc}
        disabled={value >= max}
        aria-label="Збільшити кількість"
        className={cn(btn, 'rounded-r-md')}
      >
        <Plus className={glyph} />
      </button>
    </div>
  );
}
