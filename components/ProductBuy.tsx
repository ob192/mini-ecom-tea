'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { uah } from '@/lib/format';
import { priceFor, defaultWeight, collapseToTier, UNIT } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { trackAddToCart, trackViewItem } from '@/lib/analytics';
import { Banknote, Check, Package, ShoppingBag, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QtyStepper } from '@/components/ui/qty-stepper';
import { InfoRow, InfoRows } from '@/components/ui/info-row';

/*
  ProductBuy — «Список рівнів», the owner's choice from /playground/buy on
  2026-11-10.

  The weight tiers are rows, not chips: weight, price, and price per gram, with
  the cheapest per gram marked. It is the only shape that shows what the
  catalogue actually earns on — that the larger pack is better value — and the
  one place a visitor can compare four tiers instead of guessing between them.

  The headline price lives here, not on the page, because it is tied to the
  selector: picking 50 г must repoint the price at that tier. On the page it
  could only ever print `product.price`, which is the *cheapest* tier — so the
  page once read «від 310 ₴ / 25 г» while the 50 г chip was selected. The static
  parts of the buy column (SKU tags, description) are passed through as
  `children` so they stay server-rendered between the price and the selector.

  Pricing behaviour is unchanged: the server recomputes every total from
  public/products.json, and `collapseToTier` still rewrites N packs of a small
  tier into the cheaper larger tier before anything is added.

  On phones the buy row rides in `.sticky-bar`, which lifts itself by
  `--cookie-notice-h`. Without that handshake the cookie notice covered 89% of
  «Додати в кошик» on a 375×812 phone and the tap landed on «Добре».
*/
export function ProductBuy({
  product,
  children,
}: {
  product: Product;
  children?: React.ReactNode;
}) {
  const { add } = useCart();
  const router = useRouter();
  const [weight, setWeight] = useState<number>(defaultWeight(product));
  const [qty, setQty] = useState(1);

  // GA4 `view_item` — once per product, at the default tier. This lives in the
  // buy box because the product page itself is a server component. Keyed by
  // slug, since re-renders hand us a fresh `product` object each time.
  const viewedSlug = useRef<string | null>(null);
  useEffect(() => {
    if (viewedSlug.current === product.slug) return;
    viewedSlug.current = product.slug;
    trackViewItem(product, defaultWeight(product));
  }, [product]);

  // Buying N packs of one tier that add up to another tier's weight should
  // charge that tier's (cheaper) price instead of N × the smaller price.
  useEffect(() => {
    const collapsed = collapseToTier(product, weight, qty);
    if (collapsed.weight !== weight || collapsed.qty !== qty) {
      setWeight(collapsed.weight);
      setQty(collapsed.qty);
    }
  }, [product, weight, qty]);

  const hasTiers = product.priceTiers.length > 1;
  /*
    Ukrainian uses a decimal comma, and `toFixed` does not know that (T11). The
    per-gram figure is also what a screen reader reads out of the tier row, so
    it has to be a number a person would say.
  */
  const perGramFmt = new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const unitPrice = priceFor(product, weight);
  const buyable = product.inStock && unitPrice != null;
  const total = unitPrice != null ? unitPrice * qty : null;

  // The best value per gram, which is the one worth pointing at.
  const perGram = product.priceTiers.map((t) => t.price / t.weight);
  const bestTier = perGram.length ? perGram.indexOf(Math.min(...perGram)) : -1;

  const handleAdd = () => {
    if (!buyable) return;
    add(product.slug, weight, qty);
    trackAddToCart(product, weight, qty);
    router.push('/cart');
  };

  return (
    <>
      <p className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums">
          {unitPrice != null ? uah(unitPrice) : 'Ціна за запитом'}
        </span>
        {weight ? (
          <span className="text-sm text-muted-foreground">
            / {weight} {UNIT}
          </span>
        ) : null}
      </p>

      {children}

      {hasTiers ? (
        <fieldset className="mt-8">
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
                    /*
                      Without this the accessible name is the row's text content
                      run together — «25 г270 ₴10.8 ₴ / г», observed in the
                      keyboard walk. Spelled out, it is a sentence.
                    */
                    aria-label={`${t.weight} ${UNIT} — ${uah(t.price)}, ${perGramFmt.format(
                      t.price / t.weight,
                    )} ₴ за грам`}
                    onClick={() => setWeight(t.weight)}
                    className={`flex min-h-14 w-full items-center gap-3 rounded-md border px-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      on
                        ? 'border-foreground bg-primary-subtle'
                        : 'border-input hover:border-border-strong hover:bg-foreground/5'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                        on ? 'border-foreground bg-primary' : 'border-input'
                      }`}
                    >
                      {on ? <Check className="size-3 text-primary-foreground" /> : null}
                    </span>
                    <span className="font-medium tabular-nums">
                      {t.weight} {UNIT}
                    </span>
                    {i === bestTier ? (
                      <Badge variant="primary" className="ml-1">
                        Вигідніше
                      </Badge>
                    ) : null}
                    <span className="ml-auto shrink-0 text-right">
                      <span className="block font-semibold tabular-nums">{uah(t.price)}</span>
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {perGramFmt.format(t.price / t.weight)} ₴ / {UNIT}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : null}

      {/*
        `flex-wrap` with a min width on the button. The label is one line by
        design (T13), so its min-content width wins over `flex-1` and the row
        could not shrink: at 320 the button ran 18px past the screen edge. Now
        it drops to its own full-width line when the stepper and the label stop
        fitting side by side, which happens below about 350px.
      */}
      <div className="sticky-bar mt-8 flex flex-wrap items-stretch gap-2.5">
        <QtyStepper
          value={qty}
          onDec={() => setQty((q) => Math.max(1, q - 1))}
          onInc={() => setQty((q) => Math.min(99, q + 1))}
        />
        <Button onClick={handleAdd} disabled={!buyable} className="min-w-40 flex-1">
          <ShoppingBag />
          {buyable
            ? total != null && qty > 1
              ? `Додати за ${uah(total)}`
              : 'Додати в кошик'
            : 'Немає в наявності'}
        </Button>
      </div>

      <InfoRows className="mt-7 border-t border-border pt-6">
        <InfoRow icon={<Truck />}>Доставка Новою поштою, 1–3 дні</InfoRow>
        <InfoRow icon={<Package />}>Самовивіз — відділення Нової пошти</InfoRow>
        <InfoRow icon={<Banknote />}>Оплата при отриманні</InfoRow>
      </InfoRows>
    </>
  );
}
