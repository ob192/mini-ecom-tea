'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { categories } from '@/lib/products';
import { Logo } from './Logo';
import { CartIcon, ChevLeftIcon } from './Icons';

export function Header({ title, back = false }: { title?: string; back?: boolean }) {
  const { count, ready } = useCart();
  const router = useRouter();
  const showNav = !back && !title; // home header only

  return (
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-md border-b border-line">
      <div className="relative flex items-center justify-between h-[52px] px-4 md:px-8">
        {back ? (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Назад"
            className="w-11 h-11 flex items-center justify-center rounded-full text-ink hover:bg-green-tint transition-colors"
          >
            <ChevLeftIcon width={22} height={22} />
          </button>
        ) : (
          <Link href="/" aria-label="TEA CHE — на головну" className="flex items-center h-11 pr-1.5">
            <Logo size={19} />
          </Link>
        )}

        {title ? (
          <h1 className="font-display font-semibold text-[18px] tracking-wide text-ink">{title}</h1>
        ) : null}

        {showNav ? (
          <nav
            aria-label="Категорії"
            className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2"
          >
            <Link
              href="/"
              className="px-3 py-2 rounded-full font-display font-medium text-[14px] text-ink-soft hover:text-green hover:bg-green-tint transition-colors"
            >
              Всі
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/?cat=${c.slug}`}
                className="px-3 py-2 rounded-full font-display font-medium text-[14px] text-ink-soft hover:text-green hover:bg-green-tint transition-colors whitespace-nowrap"
              >
                {c.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <Link
          href="/cart"
          aria-label={`Кошик${ready && count > 0 ? `, ${count} товарів` : ''}`}
          className="relative w-11 h-11 flex items-center justify-center rounded-full text-ink hover:bg-green-tint transition-colors"
        >
          <CartIcon width={22} height={22} />
          {ready && count > 0 ? (
            <span className="absolute -top-[2px] -right-[1px] min-w-[19px] h-[19px] px-[5px] rounded-full bg-amber text-[#2A1E08] font-display font-semibold text-[11px] flex items-center justify-center shadow-[0_0_0_2px_var(--paper)]">
              {count}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
