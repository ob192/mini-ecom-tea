import * as React from 'react';

import { cn } from '@/lib/utils';

/*
  SectionHeading — a section's title on the left and, optionally, one action or
  a pair of carousel arrows on the right. Renders an `<h2>`; pass `as` where the
  document outline needs something else (T15).
*/
export function SectionHeading({
  as: Tag = 'h2',
  action,
  lead,
  className,
  children,
  ...props
}: {
  as?: 'h1' | 'h2' | 'h3';
  action?: React.ReactNode;
  lead?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-x-6 gap-y-3', className)}>
      <div className="flex min-w-0 flex-col gap-2">
        <Tag className="text-2xl font-semibold text-balance sm:text-3xl" {...props}>
          {children}
        </Tag>
        {lead ? <p className="max-w-prose text-base text-muted-foreground text-pretty">{lead}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </div>
  );
}
