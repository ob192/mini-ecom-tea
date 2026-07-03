'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { useCart } from '@/context/CartContext';
import { getProduct, priceFor, UNIT } from '@/lib/products';
import { uah, plural } from '@/lib/format';
import { Header } from '@/components/Header';
import { Stepper, ProductImage } from '@/components/Logo';
import { CartIcon, LeafIcon, TrashIcon, ArrowIcon } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { CartItem } from '@/lib/types';

function CartRow({
                   item,
                   onDec,
                   onInc,
                   onRemove,
                 }: {
  item: CartItem;
  onDec: (slug: string, weight: number) => void;
  onInc: (slug: string, weight: number) => void;
  onRemove: (slug: string, weight: number) => void;
}) {
  const p = getProduct(item.slug);
  if (!p) return null;
  const unit = priceFor(p, item.weight) ?? 0;

  return (
      <div className="flex gap-3 py-3.5 items-start">
        <Link href={`/product/${p.slug}`} className="w-[66px] shrink-0 rounded-[14px] overflow-hidden">
          <ProductImage src={p.image} category={p.category} alt={p.title} ratio="1 / 1" tag="" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-2">
            <Link
                href={`/product/${p.slug}`}
                className="font-display font-medium text-[15.5px] text-ink leading-tight"
            >
              {p.title}
            </Link>
            <button
                type="button"
                onClick={() => onRemove(item.slug, item.weight)}
                aria-label={`Видалити ${p.title} з кошика`}
                className="w-[30px] h-[30px] -mt-1 -mr-1 shrink-0 flex items-center justify-center text-ink-faint hover:text-danger transition-colors"
            >
              <TrashIcon width={19} height={19} />
            </button>
          </div>
          <div className="text-ink-faint text-[12.5px] mt-0.5 mb-2.5">
            {item.weight ? `${item.weight} ${UNIT} · ` : ''}
            {uah(unit)}
          </div>
          <div className="flex items-center justify-between">
            <Stepper
                size="sm"
                value={item.qty}
                onDec={() => onDec(item.slug, item.weight)}
                onInc={() => onInc(item.slug, item.weight)}
            />
            <span className="font-display font-semibold text-[16px] text-green-deep">
            {uah(unit * item.qty)}
          </span>
          </div>
        </div>
      </div>
  );
}

export function CartView() {
  const { items, ready, count, subtotal, delivery, total, freeDeliveryThreshold, inc, dec, remove } =
      useCart();

  if (!ready) {
    return (
        <>
          <Header title="Кошик" back />
          <div className="px-[18px] py-16 text-center text-ink-faint">Завантаження…</div>
        </>
    );
  }

  if (items.length === 0) {
    return (
        <>
          <Header title="Кошик" back />
          <div className="animate-screenIn flex-1 flex flex-col items-center justify-center text-center px-8 py-16 gap-1.5 min-h-[60vh]">
            <div className="w-[84px] h-[84px] rounded-full bg-green-tint flex items-center justify-center text-green mb-2">
              <CartIcon width={36} height={36} />
            </div>
            <h2 className="font-display text-[23px] text-ink">Кошик порожній</h2>
            <p className="m-0 mb-4 text-ink-soft text-[15px] max-w-[26ch]">
              Додайте улюблений чай — і він з&apos;явиться тут.
            </p>
            <Button asChild variant="pill" size="xl">
              <Link href="/">
                <LeafIcon width={18} height={18} /> Перейти до каталогу
              </Link>
            </Button>
          </div>
        </>
    );
  }

  const remaining = freeDeliveryThreshold - subtotal;

  return (
      <>
        <Header title="Кошик" back />
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:items-start lg:max-w-[1040px] lg:mx-auto lg:w-full lg:px-8 lg:py-6">
          <div className="animate-screenIn px-[18px] pt-1 pb-2 lg:px-0 lg:pt-0">
            <div className="text-ink-faint text-[13px] pt-2 pb-0.5 lg:pt-0">
              {count} {plural(count, 'товар', 'товари', 'товарів')} у кошику
            </div>
            <div>
              {items.map((it, i) => (
                  <Fragment key={`${it.slug}|${it.weight}`}>
                    {i > 0 && <hr className="divider" />}
                    <CartRow item={it} onDec={dec} onInc={inc} onRemove={remove} />
                  </Fragment>
              ))}
            </div>
          </div>

          <div className="px-[18px] lg:px-0 lg:sticky lg:top-20">
            <Card className="p-4 mt-3.5 lg:mt-0 flex flex-col gap-[11px]">
              <div className="flex justify-between items-baseline text-[15px] text-ink-soft">
                <span>Сума</span>
                <span className="font-display font-semibold text-ink">{uah(subtotal)}</span>
              </div>
              <div className="flex justify-between items-baseline text-[15px] text-ink-soft">
                <span>Доставка</span>
                <span className={delivery === 0 ? 'text-ok' : 'text-ink'}>
                {delivery === 0 ? 'Безкоштовно' : uah(delivery)}
              </span>
              </div>
              {delivery > 0 && remaining > 0 ? (
                  <div className="text-[12.5px] text-ink-faint -mt-1">
                    Безкоштовна доставка від {uah(freeDeliveryThreshold)} — додайте ще {uah(remaining)}
                  </div>
              ) : null}
              <hr className="divider" />
              <div className="flex justify-between items-baseline font-display font-semibold text-[21px] text-ink">
                <span>Разом</span>
                <span>{uah(total)}</span>
              </div>
            </Card>

              {/* CTA button — plain block, no sticky-bar wrapper (that's what added the flat rectangle) */}
              <Button
                  asChild
                  variant="pill"
                  size="xl"
                  className="w-full mt-3.5 px-4 sm:px-[22px]"
              >
                  <Link href="/checkout" className="justify-center text-[16px] sm:text-[18px]">
                      <span className="truncate">Оформити</span>
                      <ArrowIcon width={18} height={18} />
                  </Link>
              </Button>
          </div>
        </div>
      </>
  );
}