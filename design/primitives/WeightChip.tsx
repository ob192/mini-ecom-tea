'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/*
  WeightChip — the `Вибір ваги` panel.

  A two-line chip: the tier's weight in 14/700, its price beneath in 11/400.
  Selected chips invert to a green fill with the price at 80% opacity; the
  hairline is drawn in green rather than line so the outline does not go
  missing against the fill.

  The pair is a radio group, not a set of toggles — exactly one tier is always
  chosen — so this renders a button with `aria-pressed` and the parent owns the
  selection. See ProductBuy for the wiring.
*/
export interface WeightChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  weight: string;
  price?: string;
  selected?: boolean;
}

export const WeightChip = React.forwardRef<HTMLButtonElement, WeightChipProps>(
  ({ weight, price, selected = false, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      className={cn(
        'flex flex-col items-center gap-0.5 rounded px-[18px] py-[9px] font-body transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-paper',
        'disabled:pointer-events-none disabled:opacity-45',
        selected
          ? 'bg-green shadow-[inset_0_0_0_1px_var(--green)]'
          : 'bg-card shadow-hairline hover:shadow-[inset_0_0_0_1px_var(--green-600)]',
        className,
      )}
      {...props}
    >
      <span className={cn('text-[14px] font-bold leading-none', selected ? 'text-on-green' : 'text-ink')}>
        {weight}
      </span>
      {price ? (
        <span className={cn('text-[11px] leading-none', selected ? 'text-on-green/80' : 'text-ink-faint')}>
          {price}
        </span>
      ) : null}
    </button>
  ),
);
WeightChip.displayName = 'WeightChip';
