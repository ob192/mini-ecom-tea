'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { categoryLabel, defaultWeight, UNIT } from '@/lib/products';
import { uah } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { ProductImage } from './Logo';
import { CartIcon, CheckIcon } from './Icons';
import { Button } from '@/components/ui/button';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const hasTiers = product.priceTiers.length > 1;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    add(product.slug, defaultWeight(product), 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1300);
  };

  return (
      <article className="bg-card rounded-lg shadow-sh-1 overflow-hidden flex flex-col transition hover:-translate-y-0.5 hover:shadow-sh-2">
        <Link href={`/product/${product.slug}`} className="block" aria-label={product.title}>
          <ProductImage
              src={product.image}
              category={product.category}
              alt={`${product.title} — ${product.subtitle}`}
              ratio="1 / 1"
              priority={priority}
          />
        </Link>
        <div className="p-[11px_12px_12px] flex flex-col flex-1 gap-1.5">
          <Link
              href={`/product/${product.slug}`}
              className="font-display font-medium text-[15.5px] leading-tight text-ink"
          >
            {product.title}
          </Link>
          <div className="text-[12px] text-ink-faint">
            {product.weight ? `${product.weight} ${UNIT} · ` : ''}
            {categoryLabel(product.category)}
          </div>
          <span className="font-display font-semibold text-[18px] text-green-deep mt-auto">
          {product.price != null ? `${hasTiers ? 'від ' : ''}${uah(product.price)}` : 'Ціна за запитом'}
        </span>
          <Button
              variant={added ? 'amber' : 'pill'}
              onClick={handleAdd}
              disabled={!product.inStock}
              className="h-10 w-full text-[14px] active:scale-[0.96] disabled:opacity-45"
          >
            {!product.inStock ? (
                'Немає'
            ) : added ? (
                <>
                  <CheckIcon width={16} height={16} /> Додано
                </>
            ) : (
                <>
                  <CartIcon width={16} height={16} /> До кошика
                </>
            )}
          </Button>
        </div>
      </article>
  );
}