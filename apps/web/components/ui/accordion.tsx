import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

/*
  Accordion — built on `<details>`/`<summary>` rather than Radix, deliberately:
  it works with no client JavaScript, is keyboard- and screen-reader-native, and
  keeps its content in the DOM while collapsed, so a crawler reads the brewing
  copy on a product page. The chevron rotates off the `open` attribute in CSS.
*/
export interface AccordionProps
  extends Omit<React.HTMLAttributes<HTMLDetailsElement>, 'title' | 'children'> {
  title: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Accordion({
  title,
  defaultOpen = false,
  className,
  children,
  ...props
}: AccordionProps) {
  return (
    <details open={defaultOpen} className={cn('group border-b border-border', className)} {...props}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <span className="text-pretty">{title}</span>
        <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}
