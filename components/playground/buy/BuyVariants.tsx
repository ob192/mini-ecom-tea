'use client';

import * as React from 'react';
import Image from 'next/image';
import { Banknote, Check, Package, ShoppingBag, Truck } from 'lucide-react';

import { Accordion } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InfoRow, InfoRows } from '@/components/ui/info-row';
import { QtyStepper } from '@/components/ui/qty-stepper';
import { WeightChip } from '@/components/ui/weight-chip';
import { priceFor, UNIT } from '@/lib/products';
import { uah } from '@/lib/format';
import type { Product } from '@/lib/types';

/*
  Three buy blocks for the product page — gallery, weight tiers, quantity,
  price and the action — rendered from a real four-tier pu-erh.

  Kept in all three, because they are decisions:

  - The price is the **chosen tier's** price, tied to the chips. Printing
    `product.price` on the page could only ever show the cheapest tier, which is
    how it once read «від 310 ₴ / 25 г» with the 50 г chip selected.
  - On phones the action rides in `.sticky-bar`, which lifts itself by
    `--cookie-notice-h`. Without that handshake the cookie notice covered 89% of
    «Додати в кошик» on a 375×812 phone and the tap landed on «Добре».
  - The chips are 44px tall and the stepper's hit areas are 44px, so the row is
    thumb-sized (M1).
*/

const INFO = (
  <InfoRows>
    <InfoRow icon={<Truck />}>Доставка Новою поштою, 1–3 дні</InfoRow>
    <InfoRow icon={<Package />}>Самовивіз — відділення Нової пошти</InfoRow>
    <InfoRow icon={<Banknote />}>Оплата при отриманні</InfoRow>
  </InfoRows>
);

function useBuy(product: Product) {
  const [weight, setWeight] = React.useState(product.priceTiers[0]?.weight ?? 0);
  const [qty, setQty] = React.useState(1);
  const unit = priceFor(product, weight);
  return { weight, setWeight, qty, setQty, unit };
}

function Gallery({ product, tall = false }: { product: Product; tall?: boolean }) {
  const [active, setActive] = React.useState(0);
  const images = product.images.length ? product.images : [''];
  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative overflow-hidden rounded-xl bg-card ${tall ? 'aspect-4/5' : 'aspect-square'}`}
      >
        {images[active] ? (
          <Image
            src={images[active]}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 34rem, 100vw"
            className="object-cover"
            priority
          />
        ) : null}
      </div>
      {images.length > 1 ? (
        <ul className="flex list-none gap-2" aria-label="Фотографії товару">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Фото ${i + 1}`}
                aria-current={i === active ? 'true' : undefined}
                className={`relative size-16 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  i === active ? 'border-primary' : 'border-transparent hover:border-border-strong'
                }`}
              >
                <Image src={src} alt="" fill sizes="4rem" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/* ── 1 ───────────────────────────────────────────────────────────────────── */
/**
 * Stack. The shipped shape, tidied: price, chips, then the quantity and the
 * action in one row. Everything in reading order, nothing framed.
 */
export function BuyStack({ product }: { product: Product }) {
  const { weight, setWeight, qty, setQty, unit } = useBuy(product);
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
      <Gallery product={product} />

      <div className="flex flex-col">
        <div className="flex flex-wrap gap-2">
          <Badge variant="subtle">Пуер · Шу</Badge>
          <Badge variant="success">
            <Check /> В наявності
          </Badge>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-balance">{product.title}</h1>
        <p className="mt-2 text-base text-muted-foreground text-pretty">{product.subtitle}</p>

        <p className="mt-6 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums">
            {unit != null ? uah(unit) : 'Ціна за запитом'}
          </span>
          <span className="text-sm text-muted-foreground">
            / {weight} {UNIT}
          </span>
        </p>

        <h2 className="mt-7 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Вага
        </h2>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Вага">
          {product.priceTiers.map((t) => (
            <WeightChip
              key={t.weight}
              weight={`${t.weight} ${UNIT}`}
              price={uah(t.price)}
              selected={t.weight === weight}
              onClick={() => setWeight(t.weight)}
            />
          ))}
        </div>

        <div className="sticky-bar mt-7 flex items-stretch gap-2.5">
          <QtyStepper
            value={qty}
            onDec={() => setQty((q) => Math.max(1, q - 1))}
            onInc={() => setQty((q) => Math.min(99, q + 1))}
          />
          <Button className="flex-1">
            <ShoppingBag />
            Додати в кошик
          </Button>
        </div>

        {qty > 1 && unit != null ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Разом: <span className="font-semibold text-foreground tabular-nums">{uah(unit * qty)}</span>
          </p>
        ) : null}

        <div className="mt-7 border-t border-border pt-6">{INFO}</div>
      </div>
    </div>
  );
}

/* ── 2 ───────────────────────────────────────────────────────────────────── */
/**
 * Panel. Everything a buyer decides — tier, quantity, price, action — collected
 * on one `card` surface, with the description left outside it. The block
 * becomes a thing you can point at, and on desktop it sticks while the
 * description scrolls.
 */
export function BuyPanel({ product }: { product: Product }) {
  const { weight, setWeight, qty, setQty, unit } = useBuy(product);
  const total = unit != null ? unit * qty : null;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10 lg:px-8">
      <div className="flex flex-col gap-6">
        <Gallery product={product} />
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="subtle">Пуер · Шу</Badge>
            <Badge variant="success">
              <Check /> В наявності
            </Badge>
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-balance">{product.title}</h1>
          <p className="mt-2 max-w-prose text-base text-muted-foreground text-pretty">
            {product.subtitle}
          </p>
        </div>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="flex flex-col gap-5 rounded-xl bg-card p-5">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Вага
            </h2>
            <div className="mt-2.5 flex flex-wrap gap-2" role="group" aria-label="Вага">
              {product.priceTiers.map((t) => (
                <WeightChip
                  key={t.weight}
                  weight={`${t.weight} ${UNIT}`}
                  price={uah(t.price)}
                  selected={t.weight === weight}
                  onClick={() => setWeight(t.weight)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Кількість</span>
            <QtyStepper
              size="sm"
              value={qty}
              onDec={() => setQty((q) => Math.max(1, q - 1))}
              onInc={() => setQty((q) => Math.min(99, q + 1))}
            />
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-muted-foreground">Разом</span>
            <span className="text-3xl font-semibold tabular-nums">
              {total != null ? uah(total) : '—'}
            </span>
          </div>

          <Button className="w-full" size="lg">
            <ShoppingBag />
            Додати в кошик
          </Button>

          {INFO}
        </div>

        {/* On phones the panel is not sticky — the action is, on its own. */}
        <div className="sticky-bar mt-5 flex items-center gap-3 lg:hidden">
          <div className="flex min-w-0 flex-col">
            <span className="text-xs text-muted-foreground">
              {weight} {UNIT} × {qty}
            </span>
            <span className="text-lg font-semibold tabular-nums">
              {total != null ? uah(total) : '—'}
            </span>
          </div>
          <Button className="flex-1">
            <ShoppingBag />
            Додати в кошик
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── 3 ───────────────────────────────────────────────────────────────────── */
/**
 * Tier list. The chips become rows — weight, price, price per gram — so the
 * tiers can be compared rather than guessed at. The largest is marked as the
 * best value, which is what the catalogue actually rewards.
 */
export function BuyTierList({ product }: { product: Product }) {
  const { weight, setWeight, qty, setQty, unit } = useBuy(product);
  const total = unit != null ? unit * qty : null;
  const perGram = product.priceTiers.map((t) => t.price / t.weight);
  const best = perGram.indexOf(Math.min(...perGram));

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
      <Gallery product={product} tall />

      <div className="flex flex-col">
        <div className="flex flex-wrap gap-2">
          <Badge variant="subtle">Пуер · Шу</Badge>
          <Badge variant="success">
            <Check /> В наявності
          </Badge>
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-balance">{product.title}</h1>
        <p className="mt-2 text-base text-muted-foreground text-pretty">{product.subtitle}</p>

        <fieldset className="mt-7">
          <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Оберіть вагу
          </legend>
          <ul className="mt-3 flex list-none flex-col gap-2">
            {product.priceTiers.map((t, i) => {
              const on = t.weight === weight;
              return (
                <li key={t.weight}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setWeight(t.weight)}
                    className={`flex min-h-14 w-full items-center gap-3 rounded-md border px-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      on
                        ? 'border-primary bg-primary-subtle'
                        : 'border-input hover:border-border-strong hover:bg-foreground/5'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                        on ? 'border-primary bg-primary' : 'border-input'
                      }`}
                    >
                      {on ? <Check className="size-3 text-primary-foreground" /> : null}
                    </span>
                    <span className="font-medium tabular-nums">
                      {t.weight} {UNIT}
                    </span>
                    {i === best ? (
                      <Badge variant="primary" className="ml-1">
                        Вигідніше
                      </Badge>
                    ) : null}
                    <span className="ml-auto text-right">
                      <span className="block font-semibold tabular-nums">{uah(t.price)}</span>
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {(t.price / t.weight).toFixed(1)} ₴ / {UNIT}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <div className="sticky-bar mt-7 flex items-stretch gap-2.5">
          <QtyStepper
            value={qty}
            onDec={() => setQty((q) => Math.max(1, q - 1))}
            onInc={() => setQty((q) => Math.min(99, q + 1))}
          />
          <Button className="flex-1">
            <ShoppingBag />
            {total != null ? `Додати за ${uah(total)}` : 'Додати в кошик'}
          </Button>
        </div>

        <div className="mt-7 border-t border-border pt-6">{INFO}</div>

        <div className="mt-6">
          <Accordion title="Приготування">
            <p className="text-base text-muted-foreground text-pretty">
              5 г на 100 мл, вода 95 °C. Перший пролив злити, далі 10–15 секунд, додаючи по пʼять
              секунд на кожен наступний.
            </p>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
