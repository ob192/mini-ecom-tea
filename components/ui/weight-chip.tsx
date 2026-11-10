'use client';

import * as React from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

/*
  WeightChip — one weight tier of a product.

  The set is a radio group, not a row of toggles: exactly one tier is always
  chosen. The parent owns the selection and this renders a button with
  `aria-pressed` (S9); the chosen chip shows a fill, a check and a heavier
  label, so the choice is never carried by colour alone (C11).

  `compact` is the same control at catalogue-card scale: one line, no price.
  It exists because the card used to draw its own look-alike chips as list
  items, so people tried to pick a weight on the card and nothing happened.
  Two chip shapes with one behaviour is the fix; two shapes with two
  behaviours was the bug.
*/
export interface WeightChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  weight: string;
  price?: string;
  selected?: boolean;
  compact?: boolean;
}

export const WeightChip = React.forwardRef<HTMLButtonElement, WeightChipProps>(
  ({ weight, price, selected = false, compact = false, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md border transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        compact ? 'h-7 px-2 text-xs' : 'h-11 min-w-16 flex-col gap-0 px-3.5',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-background text-foreground hover:border-border-strong hover:bg-foreground/5',
        className,
      )}
      {...props}
    >
      {selected && compact ? <Check className="size-3" /> : null}
      <span className={cn('tabular-nums', compact ? 'font-medium' : 'text-sm font-semibold')}>
        {weight}
      </span>
      {price && !compact ? (
        <span
          className={cn(
            'text-xs tabular-nums',
            selected ? 'text-primary-foreground/80' : 'text-muted-foreground',
          )}
        >
          {price}
        </span>
      ) : null}
    </button>
  ),
);
WeightChip.displayName = 'WeightChip';
