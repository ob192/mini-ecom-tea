'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Product, Category } from '@/lib/types';
import { plural } from '@/lib/format';
import { categoryLabel } from '@/lib/products';
import { trackSelectCategory, trackViewItemList } from '@/lib/analytics';
import { ProductCard } from './ProductCard';
import { Truck } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';

/*
  CatalogGrid — the `Explore` section of the home screens in jintea.pen.

  A section heading per category with the count beside it, then a 2-up (mobile)
  / 4-up (desktop) grid of product cards at the design's 24px gutter. The
  filter row is the design's chip shape: 4px radius, card fill, hairline,
  inverting to green when selected.

  NOTE: the free-delivery line states the threshold in prose. It has to be
  edited by hand when FREE_DELIVERY_THRESHOLD changes in lib/shipping.ts —
  Google Merchant Center compares the feed's g:shipping against what this and
  app/delivery/page.tsx say. tests/pricing.test.ts pins the pair.
*/
function FreeDeliveryBar() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
      <p className="m-0 inline-flex items-center gap-2.5 rounded-md bg-secondary px-3.5 py-2 text-sm text-foreground border border-border">
        <span className="flex shrink-0 text-muted-foreground" aria-hidden>
          <Truck className="size-4" />
        </span>
        Безкоштовна доставка від 500 ₴ по Україні
      </p>
    </div>
  );
}

export function CatalogGrid({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const searchParams = useSearchParams();
  const [activeCat, setActiveCat] = useState<string>(searchParams.get('cat') ?? 'all');

  useEffect(() => {
    setActiveCat(searchParams.get('cat') ?? 'all');
  }, [searchParams]);

  const chips = useMemo(() => [{ slug: 'all', label: 'Всі' }, ...categories], [categories]);

  const filtered = useMemo(
    () => (activeCat === 'all' ? products : products.filter((p) => p.category === activeCat)),
    [activeCat, products],
  );

  const listId = `catalog_${activeCat}`;
  const listName = activeCat === 'all' ? 'Каталог' : `Каталог · ${categoryLabel(activeCat)}`;

  // GA4 `view_item_list` — one per rendered selection, refired when the filter changes.
  useEffect(() => {
    if (filtered.length === 0) return;
    trackViewItemList(filtered, listId, listName);
  }, [filtered, listId, listName]);

  /** Position of a product in the currently rendered list (GA4 `index`). */
  const positions = useMemo(() => new Map(filtered.map((p, i) => [p.slug, i])), [filtered]);

  // Group results by category, preserving the configured category order.
  const groups = useMemo(() => {
    const order = categories.map((c) => c.slug);
    const map = new Map<string, Product[]>();
    for (const p of filtered) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return order.filter((s) => map.has(s)).map((s) => ({ slug: s, items: map.get(s)! }));
  }, [filtered, categories]);

  return (
    <>
      <FreeDeliveryBar />

      {/*
        One horizontally scrollable row on phones. Wrapping eleven categories
        stacked them four rows deep, and this bar is sticky — so a quarter of a
        390px screen was permanently covered by filter chips while scrolling.
        From `lg` there is room to wrap and no scrolling is needed.
      */}
      <div className="sticky top-14 z-20 border-b border-border bg-background/95 py-3 backdrop-blur-md">
        <div
          className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 sm:px-6 [scrollbar-width:none] lg:flex-wrap lg:overflow-x-visible lg:px-8"
          role="tablist"
          aria-label="Фільтр за категорією"
        >
          {chips.map((c) => {
            const active = activeCat === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setActiveCat(c.slug);
                  trackSelectCategory(c.slug, c.label);
                }}
                className={`min-h-11 shrink-0 whitespace-nowrap rounded-md px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active
                    ? 'bg-primary text-primary-foreground ring-1 ring-foreground active:bg-primary-strong'
                    : 'bg-card text-muted-foreground hover:bg-foreground/5 hover:text-foreground active:bg-foreground/10'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-3 text-sm text-muted-foreground lg:px-8">
        {filtered.length} {plural(filtered.length, 'позиція', 'позиції', 'позицій')}
      </div>

      {groups.length === 0 ? (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 text-center text-base text-muted-foreground lg:px-8">
          У цій категорії поки немає товарів.{' '}
          <Link href="/catalog" className="text-foreground underline underline-offset-4 hover:text-primary-subtle-foreground">
            Переглянути всі
          </Link>
        </div>
      ) : (
        groups.map((g) => (
          <section
            key={g.slug}
            className="mx-auto max-w-6xl px-4 sm:px-6 pb-10 pt-7 lg:px-8"
            aria-labelledby={`cat-${g.slug}`}
          >
            <SectionHeading
              id={`cat-${g.slug}`}
              className="scroll-mt-32"
              action={
                <span className="text-sm text-muted-foreground">{g.items.length}</span>
              }
            >
              {categoryLabel(g.slug)}
            </SectionHeading>

            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
              {g.items.map((p, i) => (
                <ProductCard
                  key={p.slug}
                  product={p}
                  priority={activeCat !== 'all' && i < 4}
                  listId={listId}
                  listName={listName}
                  index={positions.get(p.slug)}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
