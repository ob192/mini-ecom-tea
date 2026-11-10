import * as React from 'react';

import { cn } from '@/lib/utils';

/*
  Eyebrow — the one place the system still sets type in uppercase: a two- or
  three-word label above a heading («Сезон пуеру відкрито»). Headings themselves
  are sentence case, because Cyrillic all-caps is slower to read and the old
  system shouted every heading, every button and every nav item.

  It sets no colour of its own, so it inherits whatever surface it sits on and
  cannot break on the inverse band (C2). Pass `text-muted-foreground` where it
  should recede.
*/
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-xs font-semibold uppercase tracking-wide', className)} {...props} />;
}
