import * as React from 'react';

import { cn } from '@/lib/utils';

/** Page scaffolding for the reference: a section with an anchor and a title. */
export function PgSection({
  id,
  title,
  lead,
  className,
  children,
}: {
  id: string;
  title: string;
  lead?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border py-12">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {lead ? <p className="mt-2 max-w-prose text-sm text-muted-foreground">{lead}</p> : null}
        <div className={cn('mt-6', className)}>{children}</div>
      </div>
    </section>
  );
}

/** A labelled specimen inside a section. */
export function PgBlock({
  title,
  note,
  className,
  children,
}: {
  title?: string;
  note?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {title ? (
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      ) : null}
      <div className={cn('flex flex-wrap items-end gap-4', className)}>{children}</div>
      {note ? <p className="max-w-prose text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function PgCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm bg-card px-1.5 py-0.5 font-mono text-xs text-foreground">
      {children}
    </code>
  );
}
