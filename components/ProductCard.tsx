'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { categoryLabel, UNIT } from '@/lib/products';
import { uah } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { ProductImage } from './Logo';
import { CartIcon, CheckIcon } from './Icons';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(product.slug, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1300);
  };

  return (
    <article className="bg-card rounded-lg shadow-sh-1 overflow-hidden flex flex-col transition hover:-translate-y-0.5 hover:shadow-sh-2">
      <Link href={`/product/${product.slug}`} className="block" aria-label={product.name}>
        <ProductImage
          src={product.image}
          category={product.category}
          alt={`${product.name} — ${product.subtitle}`}
          ratio="1 / 1"
          priority={priority}
        />
      </Link>
      <div className="p-[11px_12px_12px] flex flex-col flex-1 gap-1.5">
        <Link href={`/product/${product.slug}`} className="font-display font-medium text-[15.5px] leading-tight text-ink">
          {product.name}
        </Link>
        <div className="text-[12px] text-ink-faint">
          {product.weight} {UNIT} · {categoryLabel(product.category)}
        </div>
        <span className="font-display font-semibold text-[18px] text-green-deep mt-auto">
          {uah(product.price)}
        </span>
        <button
          type="button"
          onClick={handleAdd}
          className={`font-display font-medium text-[14px] rounded-full h-10 w-full inline-flex items-center justify-center gap-[7px] transition active:scale-[0.96] ${
            added ? 'bg-amber text-[#2A1E08]' : 'bg-green text-on-green hover:bg-green-deep'
          }`}
        >
          {added ? (
            <><CheckIcon width={16} height={16} /> Додано</>
          ) : (
            <><CartIcon width={16} height={16} /> До кошика</>
          )}
        </button>
      </div>
    </article>
  );
}
