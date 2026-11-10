import type { Metadata } from 'next';
import Link from 'next/link';


/*
  /playground — the design system seen rather than described. Development only,
  and that is enforced in three places, because the obvious one does not work:

  1. `next.config.mjs` rewrites the whole subtree to a path no route matches in
     a production build, so Next answers 404 before any of this renders. That is
     the one that actually produces the status — see the comment there.
  2. Every page calls `devOnly()` first, so the content is never built even if
     the rewrite is ever removed.
  3. `robots: noindex`, in case a preview deploy serves it anyway.

  `force-dynamic` keeps the build from prerendering pages nothing can reach.
*/
export const dynamic = 'force-dynamic';

/** Open explorations. Each one is deleted once the owner has chosen from it. */
const EXPLORATIONS: [string, string][] = [['/playground/hero', 'Перший екран']];

export const metadata: Metadata = {
  title: 'Playground',
  robots: { index: false, follow: false },
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/playground" className="shrink-0 text-sm font-semibold">
            Playground
          </Link>
          <nav aria-label="Дослідження" className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm">
            {EXPLORATIONS.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-11 shrink-0 items-center rounded-md px-3 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="ml-auto inline-flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            ← Сайт
          </Link>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}
