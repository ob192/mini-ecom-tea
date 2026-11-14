import * as React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { cn } from '@/lib/utils';

/*
  TextLink — a quieter action than a ghost button: an underlined label with no
  surface. «Усі товари» to navigate, «Читати далі» to reveal.

  No trailing arrow. It was on every link on the site and said nothing a link
  does not already say — the underline is the affordance, and a row of identical
  chevrons is noise that competes with the one thing on a screen that should
  point anywhere (the main action). The `plus` glyph stays, because a disclosure
  genuinely means something different from a link.

  It renders a next/link when given `href` and a button otherwise, so the
  disclosure and the navigation cases share one appearance.
*/
type Glyph = 'plus' | 'none';

const base = [
  'inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-foreground',
  'underline decoration-border-strong decoration-1 underline-offset-4 transition-colors',
  'hover:text-primary-subtle-foreground hover:decoration-primary-subtle-foreground',
  'active:text-primary-subtle-foreground active:decoration-primary-subtle-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
].join(' ');

export function TextLink({
  href,
  glyph = 'none',
  className,
  children,
  ...props
}: {
  href?: string;
  glyph?: Glyph;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>) {
  const content = (
    <>
      <span>{children}</span>
      {glyph === 'plus' ? <Plus className="size-4" /> : null}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cn(base, className)}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={cn(base, className)} {...props}>
      {content}
    </button>
  );
}
