'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

/*
  The reference reads its numbers out of the browser rather than repeating them
  next to the class, so a swatch cannot claim a colour the token no longer has.
  Everything here resolves with `getComputedStyle` after mount, and renders a
  same-size placeholder on the server so nothing shifts on hydration (L19).
*/

function useResolved<T>(read: () => T): T | null {
  const [value, setValue] = React.useState<T | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => setValue(read()), []);
  return value;
}

/** sRGB relative luminance, per WCAG 2.x. */
function luminance([r, g, b]: number[]): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function parseColor(value: string): number[] | null {
  const m = value.match(/-?[\d.]+/g);
  if (!m || m.length < 3) return null;
  return m.slice(0, 3).map(Number);
}

export function contrast(a: string, b: string): number | null {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return null;
  const la = luminance(ca);
  const lb = luminance(cb);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const nf = new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * A surface with its foreground on it, and the measured contrast of the pair.
 * `need` is the ratio this pair has to clear — 4.5 for text, 3 for large text
 * and for a boundary that only has to be seen.
 */
export function ColorPair({
  surface,
  foreground,
  label,
  need = 4.5,
  sample = 'Аа Їй 570 ₴',
  className,
}: {
  surface: string;
  foreground: string;
  label: string;
  need?: number;
  sample?: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const ratio = useResolved(() => {
    if (!ref.current || !textRef.current) return null;
    return contrast(
      getComputedStyle(ref.current).backgroundColor,
      getComputedStyle(textRef.current).color,
    );
  });

  const ok = ratio === null ? null : ratio >= need;

  return (
    <div className={cn('flex min-w-52 flex-1 flex-col gap-1.5', className)}>
      <div
        ref={ref}
        className={cn('flex h-20 items-center justify-center rounded-xl px-3', surface, foreground)}
      >
        <span ref={textRef} className="text-base">
          {sample}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">{label}</span>
        <span
          className={cn(
            'font-mono text-xs tabular-nums',
            ok === null && 'text-muted-foreground',
            ok === true && 'text-success-subtle-foreground',
            ok === false && 'text-error-subtle-foreground',
          )}
        >
          {ratio === null ? '—' : `${nf.format(ratio)}:1`}
          {ok === false ? ` < ${nf.format(need)}` : ''}
        </span>
      </div>
    </div>
  );
}

/** A line, fill or icon colour measured against the surface behind it (C10, 3:1). */
export function NonTextSwatch({
  token,
  label,
  surface = 'bg-background',
}: {
  token: string;
  label: string;
  surface?: string;
}) {
  const barRef = React.useRef<HTMLDivElement>(null);
  const bgRef = React.useRef<HTMLDivElement>(null);
  const ratio = useResolved(() => {
    if (!barRef.current || !bgRef.current) return null;
    return contrast(
      getComputedStyle(barRef.current).backgroundColor,
      getComputedStyle(bgRef.current).backgroundColor,
    );
  });
  const ok = ratio === null ? null : ratio >= 3;

  return (
    <div className="flex min-w-44 flex-1 flex-col gap-1.5">
      <div ref={bgRef} className={cn('flex h-20 items-center rounded-xl px-4', surface)}>
        <div ref={barRef} className={cn('h-2 w-full rounded-full', token)} />
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">{label}</span>
        <span
          className={cn(
            'font-mono text-xs tabular-nums',
            ok === null && 'text-muted-foreground',
            ok === true && 'text-success-subtle-foreground',
            ok === false && 'text-error-subtle-foreground',
          )}
        >
          {ratio === null ? '—' : `${nf.format(ratio)}:1`}
        </span>
      </div>
    </div>
  );
}

/** One row of the type scale: the step, its resolved size and leading, a specimen. */
export function TypeRow({ step, role, sample }: { step: string; role: string; sample: string }) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const metrics = useResolved(() => {
    if (!ref.current) return null;
    const cs = getComputedStyle(ref.current);
    const size = parseFloat(cs.fontSize);
    const lh = parseFloat(cs.lineHeight);
    const tracking = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing);
    return {
      size: Math.round(size * 10) / 10,
      ratio: Math.round((lh / size) * 1000) / 1000,
      em: Math.round((tracking / size) * 1000) / 1000,
    };
  });

  return (
    <div className="grid items-baseline gap-x-6 gap-y-1 border-b border-border py-3 md:grid-cols-[7rem_11rem_1fr]">
      <span className="font-mono text-xs text-muted-foreground">{step}</span>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {metrics ? `${metrics.size}px / ${metrics.ratio}${metrics.em ? ` / ${metrics.em}em` : ''}` : '—'}
      </span>
      <p ref={ref} className={cn('min-w-0 truncate', step)} title={sample}>
        {sample}
      </p>
      <span className="text-xs text-muted-foreground md:col-span-3">{role}</span>
    </div>
  );
}
