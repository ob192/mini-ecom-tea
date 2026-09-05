'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Product, Category } from '@/lib/types';
import { plural } from '@/lib/format';
import { categoryLabel } from '@/lib/products';
import { trackSelectCategory, trackViewItemList } from '@/lib/analytics';
import { ProductCard } from './ProductCard';
import { TruckIcon } from './Icons';
import { SectionHeading } from '@/design';

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
    <div className="mx-auto max-w-content px-5 pt-6 lg:px-8">
      <p className="m-0 flex items-center gap-2.5 rounded bg-amber-tint px-4 py-3 font-body text-small text-ink shadow-hairline">
        <span className="flex shrink-0 text-green" aria-hidden>
          <TruckIcon width={16} height={16} />
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

      <div className="sticky top-[60px] z-20 border-b border-line-soft bg-paper/95 py-3 backdrop-blur-md">
        <div
          className="mx-auto flex max-w-content flex-wrap gap-2 px-5 lg:px-8"
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
                className={`min-h-[38px] rounded px-4 font-body text-nav transition-colors ${
                  active
                    ? 'bg-green text-on-green shadow-[inset_0_0_0_1px_var(--green)]'
                    : 'bg-card text-ink-soft shadow-hairline hover:text-ink'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-content px-5 pt-3 font-body text-small text-ink-faint lg:px-8">
        {filtered.length} {plural(filtered.length, 'позиція', 'позиції', 'позицій')}
      </div>

      {groups.length === 0 ? (
        <div className="mx-auto max-w-content px-5 py-16 text-center font-body text-body text-ink-soft lg:px-8">
          У цій категорії поки немає товарів.{' '}
          <Link href="/" className="text-green underline">
            Переглянути всі
          </Link>
        </div>
      ) : (
        groups.map((g) => (
          <section
            key={g.slug}
            className="mx-auto max-w-content px-5 pb-12 pt-8 lg:px-8"
            aria-labelledby={`cat-${g.slug}`}
          >
            <SectionHeading
              id={`cat-${g.slug}`}
              className="scroll-mt-[130px]"
              action={
                <span className="font-body text-small text-ink-faint">{g.items.length}</span>
              }
            >
              {categoryLabel(g.slug)}
            </SectionHeading>

            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
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
