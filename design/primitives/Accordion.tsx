import * as React from 'react';
import { ChevronDownIcon } from '@/components/Icons';
import { cn } from '@/lib/utils';

/*
  Accordion — the `Акордеон` panel, used for `ПРИГОТУВАННЯ` on the product page.

  A display-face heading with a chevron, a hairline beneath it, and the body
  below. Built on <details>/<summary> so it works with no client JavaScript and
  stays keyboard- and screen-reader-native; the chevron rotates off the
  `open` attribute in CSS. That also means the content is in the DOM for
  crawlers even while collapsed, which matters for the brewing copy.
*/
export function Accordion({
  title,
  defaultOpen = true,
  className,
  children,
  ...props
}: {
  title: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDetailsElement>, 'title' | 'children'>) {
  return (
    <details open={defaultOpen} className={cn('group w-full', className)} {...props}>
      <summary className="flex cursor-pointer list-none items-center justify-between border-b border-line pb-[14px] [&::-webkit-details-marker]:hidden">
        <span className="font-display text-[18px] font-medium uppercase tracking-[1px] text-ink">
          {title}
        </span>
        <span className="text-ink-soft transition-transform group-open:rotate-180" aria-hidden>
          <ChevronDownIcon width={20} height={20} />
        </span>
      </summary>
      <div className="pt-6">{children}</div>
    </details>
  );
}
