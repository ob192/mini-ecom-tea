'use client';

import * as React from 'react';
import { MinusIcon, PlusIcon } from '@/components/Icons';
import { cn } from '@/lib/utils';

/*
  QtyStepper — the `Лічильник кількості` panel.

  One hairline box, 4px radius, with 44x50 hit areas either side of the value.
  The 50px height is what makes it line up with the primary button beside it in
  the product page's buy row; do not shrink it without shrinking that too.

  The value is announced through `aria-live` so a screen reader hears the new
  quantity after a press, rather than only the button label.

  `sm` is not in the design file: the cart rows need a stepper that fits beside
  a 66px thumbnail, so it is the same control at a reduced hit area.
*/
export function QtyStepper({
  value,
  onDec,
  onInc,
  min = 1,
  max = 99,
  size = 'md',
  className,
  label = 'Кількість',
}: {
  value: number;
  onDec: () => void;
  onInc: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
  label?: string;
}) {
  const sm = size === 'sm';
  const btn = cn(
    'flex items-center justify-center text-ink transition-colors hover:bg-green-tint disabled:text-ink-faint disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
    sm ? 'w-9 h-10' : 'w-11 h-[50px]',
  );
  const glyph = sm ? 14 : 16;

  return (
    <div
      role="group"
      aria-label={label}
      className={cn('inline-flex items-center rounded bg-card shadow-hairline', className)}
    >
      <button
        type="button"
        onClick={onDec}
        disabled={value <= min}
        aria-label="Зменшити кількість"
        className={cn(btn, 'rounded-l')}
      >
        <MinusIcon width={glyph} height={glyph} />
      </button>
      <span
        aria-live="polite"
        className={cn('text-center font-body text-ink', sm ? 'w-7 text-[14px]' : 'w-9 text-[16px]')}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onInc}
        disabled={value >= max}
        aria-label="Збільшити кількість"
        className={cn(btn, 'rounded-r')}
      >
        <PlusIcon width={glyph} height={glyph} />
      </button>
    </div>
  );
}
