'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { uah } from '@/lib/format';
import { priceFor, defaultWeight, collapseToTier, UNIT } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { trackAddToCart, trackViewItem } from '@/lib/analytics';
import { CartIcon, TruckIcon, PackageIcon, PayIcon } from '@/components/Icons';
import { Button, QtyStepper, WeightChip, InfoRow, InfoRows } from '@/design';

/*
  ProductBuy — the weight selector, buy row and reassurance lines of the
  `Info` column on the product screens in jintea.pen.

  The buy row is a 50px-tall stepper beside a flush primary button; the
  stepper's height is what makes the two line up, so they are sized together.
  Beneath it sit the three info rows the design specifies (delivery, pickup,
  payment on receipt), separated from the controls by a hairline.

  The headline price lives here, not on the page, because the design ties it
  to the weight selector: picking 50 г must repoint the price at that tier. On
  the page it could only ever print `product.price`, which is the *cheapest*
  tier — so the page read "від 310 ₴ / 25 г" while the 50 г chip was selected.
  The static parts of the buy column (SKU tags, description) are passed through
  as `children` so they stay server-rendered between the price and the
  selector, in the order the design draws them.

  Pricing behaviour is unchanged: the server recomputes every total from
  public/products.json, and `collapseToTier` still rewrites N packs of a small
  tier into the cheaper larger tier before anything is added.
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
  const unitPrice = priceFor(product, weight);
  const buyable = product.inStock && unitPrice != null;

  const handleAdd = () => {
    if (!buyable) return;
    add(product.slug, weight, qty);
    trackAddToCart(product, weight, qty);
    router.push('/cart');
  };

  return (
    <>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-[26px] font-semibold text-ink">
          {unitPrice != null ? uah(unitPrice) : 'Ціна за запитом'}
        </span>
        {weight ? <span className="font-body text-small text-ink-faint">/ {weight} {UNIT}</span> : null}
      </p>

      {children}

      {hasTiers ? (
        <div className="mt-8">
          <h2 className="m-0 font-body text-[12px] uppercase tracking-[1.6px] text-ink-faint">
            Вага
          </h2>
          <div className="mt-3 flex flex-wrap gap-2.5" role="group" aria-label="Вага">
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
      ) : null}

      <div className="sticky-bar mt-8 flex items-stretch gap-2.5">
        <QtyStepper
          value={qty}
          onDec={() => setQty((q) => Math.max(1, q - 1))}
          onInc={() => setQty((q) => Math.min(99, q + 1))}
        />
        <Button
          onClick={handleAdd}
          disabled={!buyable}
          className="min-h-[50px] flex-1 gap-2.5"
        >
          <CartIcon width={17} height={17} aria-hidden />
          {buyable ? 'Додати в кошик' : 'Немає в наявності'}
        </Button>
      </div>

      {qty > 1 && unitPrice != null ? (
        <p className="mt-4 font-body text-small text-ink-faint">
          Разом: <span className="font-bold text-ink">{uah(unitPrice * qty)}</span>
        </p>
      ) : null}

      <InfoRows className="mt-6 border-t border-line pt-6">
        <InfoRow icon={<TruckIcon width={15} height={15} />}>
          Доставка: Україна 1–3 дні
        </InfoRow>
        <InfoRow icon={<PackageIcon width={15} height={15} />}>
          Самовивіз — Нова Пошта
        </InfoRow>
        <InfoRow icon={<PayIcon width={15} height={15} />}>Оплата при отриманні</InfoRow>
      </InfoRows>
    </>
  );
}
