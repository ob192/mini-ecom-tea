import * as React from 'react';
import { cn } from '@/lib/utils';

/*
  Tag and Eyebrow — the `Бейджі та теги` panel.

  Two tag tones are drawn, both 3px radius with 5/10 padding:
    sku       paper-deep fill, ink-soft label   — "# PU-GGB-2014"
    category  amber-tint fill, amber label      — "ПУЕР · ШУ"

  The eyebrow is not a tag: it has no surface, just wide amber tracking above a
  headline ("СЕЗОН ПУЕРУ ВІДКРИТО").
*/
export function Tag({
  tone = 'sku',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: 'sku' | 'category' | 'ok' | 'danger' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-[10px] py-[5px] font-body text-[11px]',
        tone === 'sku' && 'bg-paper-deep text-ink-soft tracking-[0.8px]',
        tone === 'category' && 'bg-amber-tint text-amber font-bold uppercase tracking-[1px]',
        tone === 'ok' && 'bg-green-tint text-ok font-bold uppercase tracking-[1px]',
        tone === 'danger' && 'bg-danger-tint text-danger font-bold uppercase tracking-[1px]',
        className,
      )}
      {...props}
    />
  );
}

export function Eyebrow({
  className,
  tone = 'amber',
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & { tone?: 'amber' | 'on-green' }) {
  return (
    <p
      className={cn(
        'm-0 font-body text-eyebrow uppercase',
        tone === 'amber' ? 'text-amber' : 'text-on-green/80',
        className,
      )}
      {...props}
    />
  );
}
