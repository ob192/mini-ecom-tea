'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { uah } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { Stepper } from '@/components/Logo';
import { CartIcon } from '@/components/Icons';

export function ProductBuy({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);

  const handleAdd = () => {
    add(product.slug, qty);
    router.push('/cart');
  };

  return (
    <>
      {/* quantity */}
      <div className="flex items-center justify-between mt-[22px] px-[18px] lg:px-0">
        <span className="font-display font-medium text-[16px] text-ink">Кількість</span>
        <Stepper
          value={qty}
          onDec={() => setQty((q) => Math.max(1, q - 1))}
          onInc={() => setQty((q) => Math.min(99, q + 1))}
        />
      </div>

      {/* action bar — sticky on mobile, inline block on desktop */}
      <div className="sticky-bar flex items-center gap-3.5 mt-6 lg:mt-7 lg:pt-6 lg:border-t lg:border-line">
        <div className="flex flex-col">
          <span className="text-[12px] text-ink-faint">Разом</span>
          <span className="font-display font-semibold text-[21px] text-ink">
            {uah(product.price * qty)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.inStock}
          className="flex-1 font-display font-medium text-[18px] rounded-full min-h-[52px] px-[22px] inline-flex items-center justify-center gap-2 bg-green text-on-green hover:bg-green-deep active:scale-[0.98] transition disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <CartIcon width={19} height={19} />
          {product.inStock ? 'Додати в кошик' : 'Немає в наявності'}
        </button>
      </div>
    </>
  );
}
