import * as React from 'react';
import Link from 'next/link';
import { ArrowIcon, PlusIcon } from '@/components/Icons';
import { cn } from '@/lib/utils';

/*
  TextLink — the `Текстові посилання` panel.

  A bare uppercase label with a trailing glyph and no surface of its own:
  "ЧИТАТИ ДАЛІ +" to reveal, "УСІ ТОВАРИ →" to navigate. 12px, 1px of
  tracking, ink — quieter than a ghost button, which is 13/700.

  Renders as a next/link when given `href`, otherwise as a button, so the
  disclosure and the navigation cases share one appearance.
*/
type Glyph = 'arrow' | 'plus' | 'none';

const base =
  'inline-flex items-center gap-[5px] text-eyebrow uppercase text-ink transition-colors hover:text-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm';

function GlyphIcon({ glyph }: { glyph: Glyph }) {
  if (glyph === 'arrow') return <ArrowIcon width={14} height={14} />;
  if (glyph === 'plus') return <PlusIcon width={13} height={13} />;
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
      {children}
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
