'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

import type { Product } from '@/lib/types';
import { categoryLabel, defaultWeight, priceFor, UNIT } from '@/lib/products';
import { uah } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { trackAddToCart, trackSelectItem } from '@/lib/analytics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WeightChip } from '@/components/ui/weight-chip';
import { ProductImage } from './Logo';

/*
  ProductCard — «Картка», the owner's choice from /playground/card on
  2026-11-10.

  Everything sits on the `card` surface and the action is a full-width button
  that says what it does. The previous card put the action in a wordless round
  «+» inset into the photograph: it is smaller, it is only found by someone
  already looking for it, and adding to the cart from a phone is precisely what
  was not happening.

  The chips are the tier selector, and the price above them is the price of the
  chosen tier. They used to be list items styled exactly like real chips with
  one highlighted, so people pressed them and nothing moved — and the highlight
  marked 50 г while the price read «від 310 ₴» (the 25 г tier) and the add
  button put the 50 г pack in the basket. Three weights implied by one card. Now
  one tier is selected, its price is shown, and that tier is added.
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

  const handleAdd = () => {
    if (!product.inStock) return;
    add(product.slug, weight, 1);
    trackAddToCart(product, weight, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1300);
  };

  const handleSelect = () => trackSelectItem(product, listId, listName, index);

  return (
    <article className="flex flex-col gap-3 rounded-xl bg-card p-3">
      <Link
        href={`/product/${product.slug}`}
        aria-label={product.title}
        onClick={handleSelect}
        className="relative block overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <ProductImage
          src={product.image}
          category={product.category}
          alt={`${product.title} — ${product.subtitle}`}
          ratio="6 / 5"
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
        />
        {!product.inStock ? (
          <Badge variant="error" className="absolute left-2 top-2">
            Немає
          </Badge>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 px-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {categoryLabel(product.category)}
        </p>

        {/* `min-w-0` + `break-words`: in a two-column grid at 320 a long
            single word («Цзіндечженської») is wider than its column and took
            the page into horizontal scroll (L16). */}
        <h3 className="min-w-0">
          <Link
            href={`/product/${product.slug}`}
            onClick={handleSelect}
            className="text-lg font-medium break-words text-balance transition-colors hover:text-primary-subtle-foreground"
          >
            {product.title}
          </Link>
        </h3>

        {product.priceTiers.length > 0 ? (
          <ul
            className="flex list-none flex-wrap gap-1.5 pt-0.5"
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
                  <span className="inline-flex h-7 items-center rounded-md border border-border px-2 text-xs text-muted-foreground">
                    {t.weight} {UNIT}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-auto pt-2 text-xl font-semibold tabular-nums">
          {price != null ? uah(price) : 'Ціна за запитом'}
        </p>
      </div>

      <Button
        className="w-full"
        onClick={handleAdd}
        disabled={!product.inStock}
        aria-label={
          product.inStock
            ? `Додати ${product.title}, ${weight} ${UNIT}, в кошик`
            : `${product.title} — немає в наявності`
        }
      >
        {added ? <Check /> : null}
        {added ? 'Додано' : product.inStock ? 'У кошик' : 'Немає в наявності'}
      </Button>
    </article>
  );
}
