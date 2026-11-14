import * as React from 'react';

import { cn } from '@/lib/utils';

/*
  InfoRow — one reassurance line under the buy button (delivery, pickup, payment
  on receipt). The icon is decorative: the sentence beside it carries the
  meaning, and lucide hides its own `<svg>` from assistive tech (I8).
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
    <li className={cn('flex items-start gap-2.5 text-sm text-muted-foreground', className)}>
      <span className="mt-0.5 flex shrink-0 [&_svg]:size-4">{icon}</span>
      <span className="text-pretty">{children}</span>
    </li>
  );
}

export function InfoRows({ className, children }: { className?: string; children: React.ReactNode }) {
  return <ul className={cn('flex list-none flex-col gap-2.5', className)}>{children}</ul>;
}
