import * as React from 'react';
import { cn } from '@/lib/utils';

/*
  Panel — the grouping surface every specimen in the component sheet sits on,
  and the one the informational pages use for their content blocks.

  Card fill, 1px hairline, 8px radius — the largest radius in the design. It
  carries no shadow: in this design a surface is separated by its outline.
  `padded` is on by default; turn it off for panels that hold full-bleed rows
  (spec tables, list items with their own padding).
*/
export function Panel({
  as: Tag = 'div',
  padded = true,
  className,
  children,
  ...props
}: {
  as?: 'div' | 'section' | 'aside' | 'dl';
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={cn('rounded-xl bg-card shadow-hairline', padded && 'p-6', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
