'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/types';
import { trackViewItemList } from '@/lib/analytics';
import { ProductCard } from './ProductCard';
import { ChevLeftIcon, ChevRightIcon } from './Icons';
import { IconButton, SectionHeading, TextLink } from '@/design';

/*
  ProductRail — the `Explore` section of the home frame in jintea.pen: a
  heading, a «УСІ ТОВАРИ →» link and a pair of carousel arrows over a row of
  product cards.

  The row is a real scroll container with snap points, so it works by swipe on
  a phone and by wheel or keyboard on desktop; the arrows just scroll it by one
  page. That keeps it usable if JavaScript is slow to arrive — the cards are in
  the DOM and scrollable either way — and it is why the arrows are hidden
  rather than disabled below `lg`, where nobody uses them.

  The arrows are disabled at each end, which needs the scroll position, so this
  is a client component. It is also where `view_item_list` fires for the home
  page's rail, with its own list id so the home rail and the catalogue are
  distinguishable in GA4.
*/
export function ProductRail({
  title,
  products,
  href,
  listId,
  listName,
}: {
  title: string;
  products: Product[];
  href: string;
  listId: string;
  listName: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    sync();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync]);

  useEffect(() => {
    if (products.length > 0) trackViewItemList(products, listId, listName);
  }, [products, listId, listName]);

  const page = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto max-w-content px-5 py-14 lg:px-8 lg:py-16" aria-labelledby="explore">
      <SectionHeading
        id="explore"
        action={
          <>
            <TextLink href={href}>Усі товари</TextLink>
            <div className="hidden items-center gap-2.5 lg:flex">
              <IconButton
                aria-label="Попередні товари"
                size="sm"
                surface="paper"
                onClick={() => page(-1)}
                disabled={atStart}
              >
                <ChevLeftIcon width={16} height={16} />
              </IconButton>
              <IconButton
                aria-label="Наступні товари"
                size="sm"
                surface="paper"
                onClick={() => page(1)}
                disabled={atEnd}
              >
                <ChevRightIcon width={16} height={16} />
              </IconButton>
            </div>
          </>
        }
      >
        {title}
      </SectionHeading>

      <div
        ref={scroller}
        className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto [scrollbar-width:none] lg:gap-6"
      >
        {products.map((p, i) => (
          <div
            key={p.slug}
            className="w-[calc(50%-10px)] shrink-0 snap-start lg:w-[calc(25%-18px)]"
          >
            <ProductCard
              product={p}
              priority={i < 2}
              listId={listId}
              listName={listName}
              index={i}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
