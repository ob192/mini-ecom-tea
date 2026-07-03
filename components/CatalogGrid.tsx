'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Product, Category } from '@/lib/types';
import { plural } from '@/lib/format';
import { categoryLabel } from '@/lib/products';
import { ProductCard } from './ProductCard';
import { TruckIcon } from './Icons';

function FreeDeliveryBar() {
  return (
      <div className="px-[18px] md:px-8 pt-2.5">
        <div
            className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-paper"
            style={{ background: 'linear-gradient(135deg, var(--green-600), var(--green-deep))' }}
        >
        <span className="shrink-0 flex text-amber" aria-hidden>
          <TruckIcon width={20} height={20} />
        </span>
          <span className="font-display font-semibold text-[14px] leading-tight">
          Безкоштовна доставка від 500 ₴ по Україні
        </span>
        </div>
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

        {/* filters — wrap onto multiple rows, no horizontal scrolling */}
        <div className="sticky top-[52px] z-20 bg-paper/95 backdrop-blur-md pt-2.5 pb-2.5">
          <div className="flex flex-wrap gap-2 px-[18px] md:px-8" role="tablist" aria-label="Фільтр за категорією">
            {chips.map((c) => {
              const active = activeCat === c.slug;
              return (
                  <button
                      key={c.slug}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveCat(c.slug)}
                      className={`font-display font-medium text-[14px] rounded-full min-h-[40px] px-4 transition ${
                          active
                              ? 'bg-green text-on-green shadow-sh-1'
                              : 'bg-card text-ink-soft shadow-[inset_0_0_0_1px_var(--line)] hover:text-green'
                      }`}
                  >
                    {c.label}
                  </button>
              );
            })}
          </div>
        </div>

        <div className="px-[18px] md:px-8 pt-1 pb-1 text-ink-faint text-[13px]">
          {filtered.length} {plural(filtered.length, 'позиція', 'позиції', 'позицій')}
        </div>

        {groups.length === 0 ? (
            <div className="px-[18px] md:px-8 py-12 text-center text-ink-soft">
              У цій категорії поки немає товарів.{' '}
              <Link href="/" className="text-green underline">
                Переглянути всі
              </Link>
            </div>
        ) : (
            groups.map((g) => (
                <section key={g.slug} className="pb-3" aria-label={categoryLabel(g.slug)}>
                  <h2
                      id={`cat-${g.slug}`}
                      className="scroll-mt-[120px] px-[18px] md:px-8 pt-3 pb-2 font-display font-semibold text-[19px] text-green-deep flex items-baseline gap-2"
                  >
                    {categoryLabel(g.slug)}
                    <span className="font-body font-normal text-[13px] text-ink-faint">{g.items.length}</span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 px-4 md:px-8">
                    {g.items.map((p, i) => (
                        <ProductCard key={p.slug} product={p} priority={activeCat !== 'all' && i < 4} />
                    ))}
                  </div>
                </section>
            ))
        )}

        <div className="pb-10" />
      </>
  );
}