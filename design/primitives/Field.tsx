import * as React from 'react';
import { cn } from '@/lib/utils';

/*
  Field — the text input from the `Поле вводу` panel.

  Paper fill inside a card (so the input reads as recessed), 1px hairline, 4px
  radius, 14px placeholder. Focus thickens the hairline to green rather than
  drawing a separate ring, matching the flat treatment used elsewhere.

  16px on the value, not 14: iOS Safari zooms the viewport on focus for
  anything smaller, which is a real problem on the checkout form. The design's
  14px is kept for the placeholder-sized `sm` variant only, which is never used
  for a text entry the customer types into on mobile.
*/
export const Field = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full min-h-[48px] rounded bg-paper px-[14px] py-2.5 font-body text-[16px] text-ink',
        'border border-line transition-colors placeholder:text-ink-faint',
        'focus:border-green focus:outline-none focus:ring-1 focus:ring-green',
        'aria-[invalid=true]:border-danger aria-[invalid=true]:bg-danger-tint',
        'aria-[invalid=true]:focus:ring-danger',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Field.displayName = 'Field';
