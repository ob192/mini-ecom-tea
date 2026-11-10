'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WeightChip } from '@/components/ui/weight-chip';
import { ProductImage } from '@/components/Logo';
import { categoryLabel, priceFor, UNIT } from '@/lib/products';
import { uah } from '@/lib/format';
import type { Product } from '@/lib/types';

/*
  Three catalogue cards, each rendered from real products in
  public/products.json — a tea with three weight tiers, a pu-erh with four, a
  piece of teaware with none, and one that is out of stock. A card has to
  survive all four.

  What all three keep, because they are decisions and not options:

  - The weight chips are the tier selector, and the price above them is the
    price of the chosen tier. They used to be look-alike list items that did
    nothing when pressed, while the highlight marked one tier, the price read
    «від …» for another and the add button added a third. One tier is selected,
    its price is shown, that tier is added.
  - A product with one tier shows it as a plain label, not a control: a choice
    of one invites a press that can never do anything.
  - The whole photo is a link to the product, and the add button sits above it
    with its own accessible name, so a card is one destination and one action.
*/

function tiersOf(p: Product) {
  return p.priceTiers;
}

/* ── 1 ───────────────────────────────────────────────────────────────────── */
/**
 * Open. No surface behind the card at all — the photograph is the card and the
 * text sits on the page. The add button is a circle inset into the picture's
 * corner.
 */
export function CardOpen({ product }: { product: Product }) {
  const [weight, setWeight] = React.useState(() => tiersOf(product)[0]?.weight ?? 0);
  const [added, setAdded] = React.useState(false);
  const price = priceFor(product, weight) ?? product.price;
  const selectable = tiersOf(product).length > 1;

  return (
    <article className="flex flex-col">
      <div className="relative">
        <Link
          href={`/product/${product.slug}`}
          aria-label={product.title}
          className="block overflow-hidden rounded-xl"
        >
          <ProductImage
            src={product.image}
            category={product.category}
            alt=""
            ratio="6 / 5"
            sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 90vw"
          />
        </Link>
        <button
          type="button"
          onClick={() => {
            setAdded(true);
            setTimeout(() => setAdded(false), 1300);
          }}
          disabled={!product.inStock}
          aria-label={
            product.inStock
              ? `Додати ${product.title}, ${weight} ${UNIT}, в кошик`
              : `${product.title} — немає в наявності`
          }
          className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-card text-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
        >
          {added ? <Check className="size-5" /> : <Plus className="size-5" />}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {categoryLabel(product.category)}
        </p>
        <h3>
          <Link
            href={`/product/${product.slug}`}
            className="text-lg font-medium text-balance transition-colors hover:text-primary"
          >
            {product.title}
          </Link>
        </h3>
        <Tiers product={product} weight={weight} onPick={setWeight} selectable={selectable} />
        <p className="pt-1 text-xl font-semibold tabular-nums">
          {price != null ? uah(price) : 'Ціна за запитом'}
        </p>
      </div>
    </article>
  );
}

/* ── 2 ───────────────────────────────────────────────────────────────────── */
/**
 * Card. Everything on the `card` surface, and the action is a labelled
 * full-width button rather than a glyph. Heavier in the grid, but «У кошик»
 * says what it does — which is the thing the mobile funnel is short of.
 */
export function CardSurface({ product }: { product: Product }) {
  const [weight, setWeight] = React.useState(() => tiersOf(product)[0]?.weight ?? 0);
  const [added, setAdded] = React.useState(false);
  const price = priceFor(product, weight) ?? product.price;
  const selectable = tiersOf(product).length > 1;

  return (
    <article className="flex flex-col gap-3 rounded-xl bg-card p-3">
      <Link
        href={`/product/${product.slug}`}
        aria-label={product.title}
        className="relative block overflow-hidden rounded-lg"
      >
        <ProductImage
          src={product.image}
          category={product.category}
          alt=""
          ratio="6 / 5"
          sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 90vw"
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
        <h3>
          <Link
            href={`/product/${product.slug}`}
            className="text-lg font-medium text-balance transition-colors hover:text-primary"
          >
            {product.title}
          </Link>
        </h3>
        <Tiers product={product} weight={weight} onPick={setWeight} selectable={selectable} />
        <p className="mt-auto pt-2 text-xl font-semibold tabular-nums">
          {price != null ? uah(price) : 'Ціна за запитом'}
        </p>
      </div>

      <Button
        className="w-full"
        disabled={!product.inStock}
        onClick={() => {
          setAdded(true);
          setTimeout(() => setAdded(false), 1300);
        }}
      >
        {added ? <Check /> : null}
        {added ? 'Додано' : product.inStock ? 'У кошик' : 'Немає в наявності'}
      </Button>
    </article>
  );
}

/* ── 3 ───────────────────────────────────────────────────────────────────── */
/**
 * Row. On a phone the card lies down: a square thumbnail on the left, the name,
 * the tiers and the price on the right. Four fit where two did, so the
 * catalogue scans at a glance. From `sm` it stands up as the card of variant 2,
 * because a row that wide would be mostly empty.
 */
export function CardRow({ product }: { product: Product }) {
  const [weight, setWeight] = React.useState(() => tiersOf(product)[0]?.weight ?? 0);
  const [added, setAdded] = React.useState(false);
  const price = priceFor(product, weight) ?? product.price;
  const selectable = tiersOf(product).length > 1;

  return (
    <>
      <article className="flex gap-3 rounded-xl bg-card p-3 sm:hidden">
        <Link
          href={`/product/${product.slug}`}
          aria-label={product.title}
          className="block w-28 shrink-0 overflow-hidden rounded-lg"
        >
          <ProductImage
            src={product.image}
            category={product.category}
            alt=""
            ratio="1 / 1"
            sizes="7rem"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="min-w-0">
            <Link href={`/product/${product.slug}`} className="text-base font-medium text-pretty">
              {product.title}
            </Link>
          </h3>
          <Tiers product={product} weight={weight} onPick={setWeight} selectable={selectable} />
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <span className="text-lg font-semibold tabular-nums">
              {price != null ? uah(price) : 'За запитом'}
            </span>
            <Button
              size="sm"
              disabled={!product.inStock}
              onClick={() => {
                setAdded(true);
                setTimeout(() => setAdded(false), 1300);
              }}
            >
              {added ? <Check /> : <Plus />}
              {added ? 'Додано' : 'У кошик'}
            </Button>
          </div>
        </div>
      </article>

      <div className="hidden sm:block">
        <CardSurface product={product} />
      </div>
    </>
  );
}

/* ── shared ──────────────────────────────────────────────────────────────── */
function Tiers({
  product,
  weight,
  onPick,
  selectable,
}: {
  product: Product;
  weight: number;
  onPick: (w: number) => void;
  selectable: boolean;
}) {
  const tiers = tiersOf(product);
  if (tiers.length === 0) return null;
  return (
    <ul
      className="flex list-none flex-wrap gap-1.5 pt-0.5"
      aria-label={`Вага — ${product.title}`}
    >
      {tiers.map((t) => (
        <li key={t.weight}>
          {selectable ? (
            <WeightChip
              compact
              weight={`${t.weight} ${UNIT}`}
              selected={t.weight === weight}
              onClick={() => onPick(t.weight)}
            />
          ) : (
            <span className="inline-flex h-7 items-center rounded-md border border-border px-2 text-xs text-muted-foreground">
              {t.weight} {UNIT}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
