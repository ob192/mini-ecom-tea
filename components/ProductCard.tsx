'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { categoryLabel, defaultWeight, priceFor, UNIT } from '@/lib/products';
import { uah } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { trackAddToCart, trackSelectItem } from '@/lib/analytics';
import { WeightChip } from '@/components/ui/weight-chip';
import { ProductImage } from './Logo';
import { Check, Plus } from 'lucide-react';

/*
  ProductCard — the `component/Product Card` reusable component in jintea.pen.

  A 6:5 photo with a 6px radius and a hairline, a circular add button inset in
  its bottom-right corner, then category / title / price / weight chips at a
  6px rhythm. There is no card surface behind it: the photo is the card, and
  the text sits directly on paper. That is why this has no border or shadow of
  its own — adding one puts a box inside a box.

  The chips are the tier selector, and the price above them is the price of the
  chosen tier.

  They used to be <li> labels — "choosing a tier happens on the product page" —
  while looking exactly like the real WeightChips, one of them highlighted.
  People pressed them and nothing moved. The highlight made it worse than
  inert: it marked the default 50 г while the price beside it read «від 310 ₴»,
  the 25 г tier, and the add button then put 510 ₴ of tea in the basket. Three
  different weights implied in one card. Now one tier is selected, the price is
  that tier's price, and the add button adds that tier.
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

  const selectable = product.priceTiers.length > 1;
  const [weight, setWeight] = useState(() => defaultWeight(product));

  // With a tier chosen there is nothing to say «від» about — that prefix
  // belongs to a card that cannot show you which price you are looking at.
  const price = priceFor(product, weight) ?? product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    add(product.slug, weight, 1);
    trackAddToCart(product, weight, 1);
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
          className="block overflow-hidden rounded-xl border border-border"
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
            product.inStock
              ? `Додати ${product.title}, ${weight} ${UNIT}, в кошик`
              : `${product.title} — немає в наявності`
          }
          className="absolute bottom-3 right-4 flex size-10 items-center justify-center rounded-full bg-card text-foreground border border-border transition-colors hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {added ? <Check className="size-5" /> : <Plus className="size-5" />}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 px-0.5 pt-4">
        <p className="m-0 text-xs uppercase text-foreground">
          {categoryLabel(product.category)}
        </p>

        <h3 className="m-0">
          <Link
            href={`/product/${product.slug}`}
            onClick={handleSelect}
            className="text-lg uppercase text-foreground transition-colors hover:text-primary"
          >
            {product.title}
          </Link>
        </h3>

        <p className="m-0 text-base font-bold text-foreground">
          {price != null ? uah(price) : 'Ціна за запитом'}
        </p>

        {product.priceTiers.length > 0 ? (
          <ul
            className="m-0 flex list-none flex-wrap gap-1.5 p-0 pt-1.5"
            aria-label={`Вага — ${product.title}`}
          >
            {product.priceTiers.map((t) => (
              <li key={t.weight}>
                {selectable ? (
                  <WeightChip
                    compact
                    weight={`${t.weight} ${UNIT}`}
                    selected={t.weight === weight}
                    onClick={() => setWeight(t.weight)}
                  />
                ) : (
                  /* One tier is not a choice; drawing it as a control invites a
                     press that can never do anything. */
                  <span className="inline-block rounded-sm bg-card px-2 py-1 text-xs text-muted-foreground border border-border">
                    {t.weight} {UNIT}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
