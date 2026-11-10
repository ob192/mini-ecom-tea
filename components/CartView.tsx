"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { getProduct, priceFor, UNIT } from "@/lib/products";
import { uah, plural } from "@/lib/format";
import { trackRemoveFromCart, trackViewCart } from "@/lib/analytics";
import { Header } from "@/components/Header";
import { ProductImage } from "@/components/Logo";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { Leaf, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CartItem } from "@/lib/types";

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
      <Link
        href={`/product/${p.slug}`}
        className="w-16 shrink-0 rounded-xl overflow-hidden"
      >
        <ProductImage
          src={p.image}
          category={p.category}
          alt={p.title}
          ratio="1 / 1"
          tag=""
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <Link href={`/product/${p.slug}`} className="text-lg font-medium">
            {p.title}
          </Link>
          <button
            type="button"
            onClick={() => onRemove(item.slug, item.weight)}
            aria-label={`Видалити ${p.title} з кошика`}
            className="size-8 -mt-1 -mr-1 shrink-0 flex items-center justify-center text-muted-foreground hover:text-error-subtle-foreground transition-colors"
          >
            <Trash2 className="size-5" />
          </button>
        </div>
        <div className="text-muted-foreground text-xs mt-0.5 mb-2.5">
          {item.weight ? `${item.weight} ${UNIT} · ` : ""}
          {uah(unit)}
        </div>
        <div className="flex items-center justify-between">
          <QtyStepper
            size="sm"
            value={item.qty}
            onDec={() => onDec(item.slug, item.weight)}
            onInc={() => onInc(item.slug, item.weight)}
          />
          <span className="text-base font-bold text-foreground">
            {uah(unit * item.qty)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CartView() {
  const {
    items,
    ready,
    count,
    subtotal,
    delivery,
    total,
    freeDeliveryThreshold,
    inc,
    dec,
    remove,
  } = useCart();

  // GA4 `view_cart` — once per visit to this screen, after hydration.
  const viewSent = useRef(false);
  useEffect(() => {
    if (!ready || viewSent.current || items.length === 0) return;
    viewSent.current = true;
    trackViewCart(items);
  }, [ready, items]);

  const handleRemove = (slug: string, weight: number) => {
    const line = items.find((i) => i.slug === slug && i.weight === weight);
    const product = getProduct(slug);
    if (line && product) trackRemoveFromCart(product, weight, line.qty);
    remove(slug, weight);
  };

  if (!ready) {
    return (
      <>
        <Header title="Кошик" back backHref="/catalog" />
        <main id="main" className="flex flex-1 flex-col [&>*]:w-full">
          <div className="px-4 py-16 text-center text-muted-foreground">
            Завантаження…
          </div>
        </main>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header title="Кошик" back backHref="/catalog" />
        <main id="main" className="flex flex-1 flex-col [&>*]:w-full">
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-6 py-24 text-center">
            <div className="size-20 rounded-full bg-card flex items-center justify-center text-muted-foreground mb-2">
              <ShoppingBag className="size-9" />
            </div>
            <h1 className="text-2xl text-foreground">Кошик порожній</h1>
            <p className="m-0 mb-4 text-muted-foreground text-base max-w-[26ch]">
              Додайте улюблений чай — і він з&apos;явиться тут.
            </p>
            <Button asChild size="lg">
              <Link href="/catalog">
                <Leaf className="size-5" /> Перейти до каталогу
              </Link>
            </Button>
          </div>
        </main>
      </>
    );
  }

  const remaining = freeDeliveryThreshold - subtotal;

  return (
    <>
      <Header title="Кошик" back backHref="/catalog" />
      <main id="main" className="flex flex-1 flex-col [&>*]:w-full">
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:items-start lg:max-w-5xl lg:mx-auto lg:w-full lg:px-8 lg:py-6">
          <div className="px-4 pt-1 pb-2 lg:px-0 lg:pt-0">
            <h1 className="m-0 text-2xl text-foreground">Кошик</h1>
            <div className="text-muted-foreground text-sm pt-1.5 pb-0.5">
              {count} {plural(count, "товар", "товари", "товарів")} у кошику
            </div>
            <div>
              {items.map((it, i) => (
                <Fragment key={`${it.slug}|${it.weight}`}>
                  {i > 0 ? <hr className="border-t border-border" /> : null}
                  <CartRow
                    item={it}
                    onDec={dec}
                    onInc={inc}
                    onRemove={handleRemove}
                  />
                </Fragment>
              ))}
            </div>
          </div>

          <div className="px-4 lg:px-0 lg:sticky lg:top-20">
            <Card className="p-4 mt-3.5 lg:mt-0 flex flex-col gap-3">
              <div className="flex justify-between items-baseline text-base text-muted-foreground">
                <span>Сума</span>
                <span className="font-semibold text-foreground">
                  {uah(subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-base text-muted-foreground">
                <span>Доставка</span>
                <span
                  className={
                    delivery === 0
                      ? "text-success-subtle-foreground"
                      : "text-foreground"
                  }
                >
                  {delivery === 0 ? "Безкоштовно" : uah(delivery)}
                </span>
              </div>
              {delivery > 0 && remaining > 0 ? (
                <div className="text-xs text-muted-foreground -mt-1">
                  Безкоштовна доставка від {uah(freeDeliveryThreshold)} —
                  додайте ще {uah(remaining)}
                </div>
              ) : null}
              <hr className="border-t border-border" />
              <div className="flex justify-between items-baseline font-semibold text-xl text-foreground">
                <span>Разом</span>
                <span>{uah(total)}</span>
              </div>
            </Card>

            {/* CTA button — plain block, no sticky-bar wrapper (that's what added the flat rectangle) */}
            <Button
              asChild

              size="lg"
              className="w-full mt-3.5 px-4 sm:px-5"
            >
              <Link href="/checkout" className="justify-center text-base">
                <span className="truncate">Оформити</span>
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
