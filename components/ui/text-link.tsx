import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';

/*
  TextLink — a quieter action than a ghost button: a label with a trailing glyph
  and no surface. «Усі товари →» to navigate, «Читати далі +» to reveal.

  It renders a next/link when given `href` and a button otherwise, so the
  disclosure and the navigation cases share one appearance. The trailing glyph
  points the way, so it goes after the label (I12).
*/
type Glyph = 'arrow' | 'plus' | 'none';

const base = [
  'inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-foreground',
  'underline decoration-border-strong decoration-1 underline-offset-4 transition-colors',
  'hover:text-primary-subtle-foreground hover:decoration-primary-subtle-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
].join(' ');

function GlyphIcon({ glyph }: { glyph: Glyph }) {
  if (glyph === 'arrow') return <ArrowRight className="size-4" />;
  if (glyph === 'plus') return <Plus className="size-4" />;
  return null;
}

export function TextLink({
  href,
  glyph = 'arrow',
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
      <GlyphIcon glyph={glyph} />
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
