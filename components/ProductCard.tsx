'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { categoryLabel, defaultWeight, UNIT } from '@/lib/products';
import { uah } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { trackAddToCart, trackSelectItem } from '@/lib/analytics';
import { ProductImage } from './Logo';
import { CheckIcon, PlusIcon } from './Icons';

/*
  ProductCard — the `component/Product Card` reusable component in jintea.pen.

  A 6:5 photo with a 6px radius and a hairline, a circular add button inset in
  its bottom-right corner, then category / title / price / weight chips at a
  6px rhythm. There is no card surface behind it: the photo is the card, and
  the text sits directly on paper. That is why this has no border or shadow of
  its own — adding one puts a box inside a box.

  The chips are labels, not controls. Choosing a tier happens on the product
  page; tapping the add button here adds the default tier, as it always has.
*/
export function ProductCard({
  product,
  priority = false,
  listId = 'catalog',
  listName = 'Каталог',
  index,
}: {
  product: Product;
  priority?: boolean;
  /** GA4 item-list context — where this card was rendered. */
  listId?: string;
  listName?: string;
  index?: number;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const hasTiers = product.priceTiers.length > 1;
  const base = defaultWeight(product);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    add(product.slug, base, 1);
    trackAddToCart(product, base, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1300);
  };

  const handleSelect = () => trackSelectItem(product, listId, listName, index);

  return (
    <article className="flex flex-col">
      <div className="relative">
        <Link
          href={`/product/${product.slug}`}
          aria-label={product.title}
          onClick={handleSelect}
          className="block overflow-hidden rounded-lg shadow-hairline"
        >
          <ProductImage
            src={product.image}
            category={product.category}
            alt={`${product.title} — ${product.subtitle}`}
            ratio="6 / 5"
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          />
        </Link>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.inStock}
          aria-label={
            product.inStock ? `Додати ${product.title} в кошик` : `${product.title} — немає в наявності`
          }
          className="absolute bottom-3 right-4 flex h-[42px] w-[42px] items-center justify-center rounded-full bg-card text-ink shadow-hairline transition-colors hover:bg-green hover:text-on-green disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {added ? <CheckIcon width={18} height={18} /> : <PlusIcon width={18} height={18} />}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 px-0.5 pt-4">
        <p className="m-0 font-body text-[11px] uppercase tracking-[1.2px] text-amber">
          {categoryLabel(product.category)}
        </p>

        <h3 className="m-0">
          <Link
            href={`/product/${product.slug}`}
            onClick={handleSelect}
            className="font-display text-card-title uppercase text-ink transition-colors hover:text-green"
          >
            {product.title}
          </Link>
        </h3>

        <p className="m-0 font-body text-[15px] font-bold text-ink">
          {product.price != null
            ? `${hasTiers ? 'від ' : ''}${uah(product.price)}`
            : 'Ціна за запитом'}
        </p>

        {product.priceTiers.length > 0 ? (
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0 pt-1.5">
            {product.priceTiers.map((t) => (
              <li
                key={t.weight}
                className={`rounded-sm px-[9px] py-1 font-body text-[11px] text-ink-soft shadow-hairline ${
                  t.weight === base ? 'bg-paper-deep' : 'bg-card'
                }`}
              >
                {t.weight} {UNIT}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
