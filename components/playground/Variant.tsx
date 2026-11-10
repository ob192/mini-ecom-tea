import * as React from 'react';

/*
  Exploration scaffolding. A label above each variant in the page's own
  container — the number and the name, then the idea and what it trades away in
  one sentence — and a viewport of nothing between variants, so each is judged
  as a first screen with none of its neighbour in view.

  Labels are not part of the design: `design-audit` hides them before it takes
  a screenshot (`[data-exploration-label]`).
*/
export function VariantLabel({
  n,
  name,
  idea,
  tradeoff,
  note,
}: {
  n: number;
  name: string;
  idea: string;
  tradeoff: string;
  note?: React.ReactNode;
}) {
  return (
    <div
      id={`v${n}`}
      data-exploration-label
      className="mx-auto w-full max-w-6xl scroll-mt-14 border-t border-border px-4 py-10 sm:px-6 lg:px-8"
    >
      <h2 className="text-2xl font-semibold">
        {n}. {name}
      </h2>
      <p className="mt-2 max-w-prose text-base text-pretty">{idea}</p>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground text-pretty">{tradeoff}</p>
      {note ? (
        <p className="mt-2 max-w-prose text-sm text-warning-subtle-foreground text-pretty">{note}</p>
      ) : null}
    </div>
  );
}

/** A viewport of nothing, so the next variant is judged on its own. */
export function VariantGap() {
  return <div data-exploration-label className="h-svh bg-subtle" aria-hidden />;
}

export function ExplorationIntro({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-exploration-label
      className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <h1 className="text-3xl font-semibold">{title}</h1>
      <div className="mt-3 flex max-w-prose flex-col gap-3 text-base text-muted-foreground text-pretty">
        {children}
      </div>
    </div>
  );
}
