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

  `compact` is the same control at catalogue-card scale: one line, no price,
  tighter padding. It exists because the card used to draw its own chips as
  <li> labels that looked exactly like these — same hairline, same one-of-them
  highlighted — so people tried to pick a weight on the card and nothing
  happened. Two chip shapes with one behaviour is the fix; two chip shapes with
  two behaviours was the bug.
*/
export interface WeightChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  weight: string;
  price?: string;
  selected?: boolean;
  /** Catalogue-card scale: single line, no price line. */
  compact?: boolean;
}

export const WeightChip = React.forwardRef<HTMLButtonElement, WeightChipProps>(
  ({ weight, price, selected = false, compact = false, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      className={cn(
        'font-body transition-colors',
        compact
          ? 'rounded-sm px-[9px] py-1'
          : 'flex flex-col items-center gap-0.5 rounded px-[18px] py-[9px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-paper',
        'disabled:pointer-events-none disabled:opacity-45',
        selected
          ? 'bg-green shadow-[inset_0_0_0_1px_var(--green)]'
          : 'bg-card shadow-hairline hover:shadow-[inset_0_0_0_1px_var(--green-600)]',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'leading-none',
          compact ? 'text-[11px]' : 'text-[14px] font-bold',
          selected ? 'text-on-green' : compact ? 'text-ink-soft' : 'text-ink',
        )}
      >
        {weight}
      </span>
      {price && !compact ? (
        <span className={cn('text-[11px] leading-none', selected ? 'text-on-green/80' : 'text-ink-faint')}>
          {price}
        </span>
      ) : null}
    </button>
  ),
);
WeightChip.displayName = 'WeightChip';
