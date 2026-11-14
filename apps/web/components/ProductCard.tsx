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
    /*
      `h-full` is what puts the price and the button of every card in a row on
      one line. The card is a flex column whose middle section is `flex-1` with
      the price on `mt-auto`, which only has slack to distribute if the card
      itself fills its cell — and it does not by default: in `ProductRail` the
      flex scroller stretches the *wrapper* to the tallest card in the row while
      the `<article>` inside keeps its own content height. Measured at 1440 on
      the home rail before this: wrappers all 442px, articles 442 / 414 / 414 /
      410 / 414, and the buttons landing at three different heights. A card with
      four weight chips wraps the chip row onto a second line and simply grew.
    */
    <article className="flex h-full flex-col gap-3 rounded-xl bg-card p-3">
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

        {/*
          `min-w-0` + `break-words`: in a two-column grid at 320 a long single
          word («Цзіндечженської») is wider than its column and took the page
          into horizontal scroll (L16).

          `text-base` and two lines on a phone. At 375 the grid column is 162px,
          and an 18px title ran to three lines on half the catalogue — the card
          came out 455px tall with a 135px photograph, which is a card that is
          two-thirds furniture for a product people buy by eye. The full title
          is one tap away on the product page (T12).
        */}
        <h3 className="min-w-0">
          <Link
            href={`/product/${product.slug}`}
            onClick={handleSelect}
            className="line-clamp-2 text-base font-medium break-words text-balance transition-colors hover:text-primary-subtle-foreground sm:line-clamp-none sm:text-lg"
          >
            {product.title}
          </Link>
        </h3>

        {/*
          The tier chips are hidden on a phone. Four of them wrap to two rows in
          a 162px column and account for a sixth of the card's height, and the
          product page now carries a far better selector (weight, price, price
          per gram, best value marked). What a card has to do on a phone is show
          the tea, name it, price it and offer one action; the weight it would
          add rides next to the price below, so nothing is implied silently.
        */}
        {product.priceTiers.length > 0 ? (
          <ul
            className="hidden list-none flex-wrap gap-1.5 pt-0.5 sm:flex"
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

        <p className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2">
          <span className="text-xl font-semibold tabular-nums">
            {price != null ? uah(price) : 'Ціна за запитом'}
          </span>
          {/* Below `sm` this is the only place the weight appears, so the
              button cannot add something the visitor did not see. */}
          {weight ? (
            <span className="text-sm text-muted-foreground tabular-nums sm:hidden">
              / {weight} {UNIT}
            </span>
          ) : null}
        </p>
      </div>

      {/*
        Teaware, figurines and the sets have no weight: `defaultWeight` falls
        through to `product.weight ?? 0` and this label announced «Додати
        Гайвань бамбук 150 мл, 0 г, в кошик» on 27 of the 44 products — a
        measurement nobody can act on, read out on every card a screen-reader
        user passes. The price line above already guards the same value; the
        button simply did not. With no weight to name, the name is the title.
      */}
      <Button
        className="w-full"
        onClick={handleAdd}
        disabled={!product.inStock}
        aria-label={
          !product.inStock
            ? `${product.title} — немає в наявності`
            : weight
              ? `Додати ${product.title}, ${weight} ${UNIT}, в кошик`
              : `Додати ${product.title} в кошик`
        }
      >
        {added ? <Check /> : null}
        {added ? 'Додано' : product.inStock ? 'У кошик' : 'Немає в наявності'}
      </Button>
    </article>
  );
}
