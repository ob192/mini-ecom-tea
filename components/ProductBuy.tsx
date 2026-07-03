'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { uah } from '@/lib/format';
import { priceFor, defaultWeight, UNIT } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { Stepper } from '@/components/Logo';
import { CartIcon } from '@/components/Icons';
import { Button } from '@/components/ui/button';

export function ProductBuy({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [weight, setWeight] = useState<number>(defaultWeight(product));
  const [qty, setQty] = useState(1);

  const hasTiers = product.priceTiers.length > 1;
  const unitPrice = priceFor(product, weight);
  const buyable = product.inStock && unitPrice != null;

  const handleAdd = () => {
    if (!buyable) return;
    add(product.slug, weight, qty);
    router.push('/cart');
  };

  return (
      <>
        {hasTiers ? (
            <div className="mt-5 px-[18px] lg:px-0">
              <span className="font-display font-medium text-[16px] text-ink">Вага</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.priceTiers.map((t) => {
                  const active = t.weight === weight;
                  return (
                      <button
                          key={t.weight}
                          type="button"
                          onClick={() => setWeight(t.weight)}
                          aria-pressed={active}
                          className={`rounded-full min-h-[44px] px-4 font-display font-medium text-[14px] transition ${
                              active
                                  ? 'bg-green text-on-green'
                                  : 'bg-card text-ink-soft shadow-[inset_0_0_0_1.5px_var(--line)] hover:text-green'
                          }`}
                      >
                        {t.weight} {UNIT} · {uah(t.price)}
                      </button>
                  );
                })}
              </div>
            </div>
        ) : null}

        <div className="flex items-center justify-between mt-[22px] px-[18px] lg:px-0">
          <span className="font-display font-medium text-[16px] text-ink">Кількість</span>
          <Stepper
              value={qty}
              onDec={() => setQty((q) => Math.max(1, q - 1))}
              onInc={() => setQty((q) => Math.min(99, q + 1))}
          />
        </div>

        <div className="sticky-bar flex items-center gap-3.5 mt-6 lg:mt-7 lg:pt-6 lg:border-t lg:border-line">
          <div className="flex flex-col">
            <span className="text-[12px] text-ink-faint">Разом</span>
            <span className="font-display font-semibold text-[21px] text-ink">
            {unitPrice != null ? uah(unitPrice * qty) : '—'}
          </span>
          </div>
          <Button
              variant="pill"
              size="xl"
              onClick={handleAdd}
              disabled={!buyable}
              className="flex-1 min-w-0 text-[16px] sm:text-[18px] px-4 sm:px-[22px] disabled:opacity-45"
          >
            <CartIcon width={19} height={19} />
            {buyable ? 'Додати в кошик' : 'Немає в наявності'}
          </Button>
        </div>
      </>
  );
}