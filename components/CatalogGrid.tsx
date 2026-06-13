'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Product, Category } from '@/lib/types';
import { plural } from '@/lib/format';
import { ProductCard } from './ProductCard';
import { TruckIcon, ArrowIcon } from './Icons';

function PromoBanner({ onClick }: { onClick: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      className="col-span-full relative overflow-hidden rounded-lg shadow-sh-2 p-[18px] flex items-center gap-[15px] cursor-pointer"
      style={{ background: 'linear-gradient(135deg, var(--green-600), var(--green-deep))' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 13px)' }}
      />
      <div className="relative z-[1] w-12 h-12 shrink-0 rounded-[14px] bg-amber text-[#2A1E08] flex items-center justify-center">
        <TruckIcon />
      </div>
      <div className="relative z-[1] flex-1 min-w-0">
        <div className="font-display font-semibold text-[17px] text-paper leading-tight">
          Безкоштовна доставка від 500 ₴
        </div>
        <div className="text-[13px] text-paper/80 mt-[3px]">
          −10% на перше замовлення · промокод{' '}
          <span className="font-display font-semibold text-amber tracking-wide">ЧАЙ10</span>
        </div>
      </div>
      <span className="relative z-[1] text-amber flex"><ArrowIcon /></span>
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
  const initial = searchParams.get('cat') ?? 'all';
  const [activeCat, setActiveCat] = useState<string>(initial);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Keep chip state in sync if the URL query changes (e.g. footer links).
  useEffect(() => {
    setActiveCat(searchParams.get('cat') ?? 'all');
  }, [searchParams]);

  const chips = useMemo(
    () => [{ slug: 'all', label: 'Всі' }, ...categories],
    [categories],
  );

  const filtered = useMemo(
    () => (activeCat === 'all' ? products : products.filter((p) => p.category === activeCat)),
    [activeCat, products],
  );

  const scrollToGrid = () => {
    anchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Splice the promo banner in after the first row (index 1).
  const items: React.ReactNode[] = [];
  filtered.forEach((p, i) => {
    items.push(<ProductCard key={p.slug} product={p} priority={i < 4} />);
    if (i === Math.min(1, filtered.length - 1)) {
      items.push(<PromoBanner key="__promo" onClick={scrollToGrid} />);
    }
  });

  return (
    <>
      {/* category chips */}
      <div className="sticky top-[52px] z-20 bg-paper pt-1">
        <div
          className="flex gap-2 overflow-x-auto px-[18px] md:px-8 pt-2.5 pb-3"
          style={{ WebkitOverflowScrolling: 'touch' }}
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
                onClick={() => setActiveCat(c.slug)}
                className={`font-display font-medium text-[14px] rounded-full min-h-[38px] px-4 whitespace-nowrap transition ${
                  active
                    ? 'bg-green text-on-green'
                    : 'bg-card text-ink-soft shadow-[inset_0_0_0_1px_var(--line)] hover:text-green'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* result count */}
      <div ref={anchorRef} className="px-[18px] md:px-8 pt-0.5 pb-2 text-ink-faint text-[13px] scroll-mt-[110px]">
        {filtered.length} {plural(filtered.length, 'позиція', 'позиції', 'позицій')}
      </div>

      {/* grid */}
      {filtered.length === 0 ? (
        <div className="px-[18px] md:px-8 py-12 text-center text-ink-soft">
          У цій категорії поки немає товарів.{' '}
          <Link href="/" className="text-green underline">
            Переглянути всі
          </Link>
        </div>
      ) : (
        <section
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 px-4 md:px-8 pb-10"
          aria-label="Каталог чаю"
        >
          {items}
        </section>
      )}
    </>
  );
}
