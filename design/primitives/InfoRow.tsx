import * as React from 'react';
import { cn } from '@/lib/utils';

/*
  InfoRow — the `Інформаційні рядки` panel.

  A green 15px icon followed by 13px ink-soft text, used for the reassurance
  lines under the buy button (delivery, pickup, payment on receipt). The icon
  is decorative: the sentence beside it already carries the meaning, so callers
  pass the icon element and it is hidden from assistive tech here.

  `InfoRows` is the list wrapper, at the 12px vertical rhythm the design uses.
*/
export function InfoRow({
  icon,
  className,
  children,
}: {
  icon: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <li className={cn('flex items-center gap-[9px] text-small text-ink-soft', className)}>
      <span className="flex shrink-0 text-green" aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}

export function InfoRows({ className, children }: { className?: string; children: React.ReactNode }) {
  return <ul className={cn('m-0 flex list-none flex-col gap-3 p-0', className)}>{children}</ul>;
}
