import * as React from 'react';
import { cn } from '@/lib/utils';

/*
  SectionHeading — the `Заголовок секції` panel.

  An uppercase display heading on the left and, optionally, controls on the
  right: the carousel arrows the design draws, or a "УСІ ТОВАРИ →" TextLink.
  Renders as an <h2> by default; pass `as` where the document outline needs
  something else.
*/
export function SectionHeading({
  as: Tag = 'h2',
  action,
  className,
  children,
  ...props
}: {
  as?: 'h1' | 'h2' | 'h3';
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <div className={cn('flex w-full items-center justify-between gap-4', className)}>
      <Tag className="m-0 font-display text-section-head uppercase text-ink" {...props}>
        {children}
      </Tag>
      {action ? <div className="flex shrink-0 items-center gap-2.5">{action}</div> : null}
    </div>
  );
}
