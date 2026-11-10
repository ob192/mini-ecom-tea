'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { categories } from '@/lib/products';
import type { Category } from '@/lib/types';
import { Logo } from './Logo';
import { Menu, ShoppingBag } from 'lucide-react';
import { BackLink } from '@/components/ui/back-link';
import { BRAND_NAME } from '@/lib/contacts';

/*
  Header — the `Header` frame of both the desktop and mobile screens in
  jintea.pen.

  One card-filled bar with a bottom hairline: wordmark on the left, category
  nav centred on desktop, cart on the right. The mobile frame swaps the nav for
  a menu button, which discloses the same category list beneath the bar.

  The design also draws search and account glyphs. Neither feature exists —
  there is no search index and no accounts — so they are not rendered rather
  than shipped as dead controls.

  `title` is no longer painted: every page that passes one already renders its
  own <h1>, and the old header printed a second one. It is kept in the API
  because the call sites read as documentation of what screen they are, and it
  labels the back row for assistive tech.
*/
/*
  The desktop nav carries six entries, as the design's header does. The
  catalogue has eleven categories, and all of them on one unwrapped row is
  ~1990px of content, which pushed the whole page into horizontal overflow at
  a 1440 viewport. The rest stay one click away everywhere they already were:
  the catalogue's filter chips, the footer, and the mobile disclosure below,
  which still lists every category.
*/
const NAV_LIMIT = 6;
const navCategories: Category[] = categories.slice(0, NAV_LIMIT);

export function Header({
  title,
  back = false,
  backHref = '/',
}: {
  title?: string;
  back?: boolean;
  /*
    Where «Назад» goes. A real destination, not history — see
    components/ui/back-link.tsx for why. Pass the page's actual parent; `/` is
    only a floor so a new `back` header can never dead-end.
  */
  backHref?: string;
}) {
  const { count, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Категорії"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="-ml-2 flex size-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-primary-subtle lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <Link
          href="/"
          aria-label={`${BRAND_NAME} — на головну`}
          className="flex items-center lg:mr-auto"
        >
          <Logo />
        </Link>

        <nav aria-label="Категорії" className="hidden items-center gap-8 lg:flex">
          {navCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/catalog?cat=${c.slug}`}
              className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {c.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          aria-label={`Кошик${ready && count > 0 ? `, ${count} товарів` : ''}`}
          className="relative -mr-2 flex size-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-primary-subtle lg:ml-auto"
        >
          <ShoppingBag className="size-5" />
          {ready && count > 0 ? (
            <span className="absolute right-0 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
              {count}
            </span>
          ) : null}
        </Link>
      </div>

      {/* Mobile disclosure for the same categories the desktop nav shows. */}
      {menuOpen ? (
        <nav
          aria-label="Категорії"
          className="border-t border-border bg-card px-5 pb-4 pt-2 lg:hidden"
        >
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/catalog?cat=${c.slug}`}
              onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {c.label}
            </Link>
          ))}
        </nav>
      ) : null}

      {back ? (
        <div
          className="mx-auto flex max-w-6xl items-center px-5 py-3 lg:px-8"
          aria-label={title}
        >
          <BackLink href={backHref} />
        </div>
      ) : null}
    </header>
  );
}
