import Image from 'next/image';
import Link from 'next/link';
import { Check, Leaf, Truck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { InfoRow, InfoRows } from '@/components/ui/info-row';
import { WeightChip } from '@/components/ui/weight-chip';
import { PhoneErrorField } from '@/components/playground/Fields';
import { getProduct, priceFor } from '@/lib/products';
import { uah } from '@/lib/format';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/shipping';

/*
  One specimen, rendered three times — once per brand direction — so the choice
  is made on the places the accent actually lands: the main action, the chosen
  weight, a badge, the brand mark, a link, and the error state next to all of
  them. Real products and real prices out of public/products.json; the only
  thing that differs between the three is which palette family `--primary` and
  its companions point at.
*/

const STARTER = 'set/start-mini-7';
const SHOWCASE = ['puer/jingmai-qiaomu-shu', 'green/longjing-cha'];

export function BrandSpecimen() {
  const starter = getProduct(STARTER);
  const cards = SHOWCASE.map(getProduct).filter(Boolean);

  return (
    <div className="bg-background text-foreground">
      {/* The offer band: a dark block over the photograph, with the one filled action. */}
      <section className="dark relative isolate flex min-h-110 items-end overflow-hidden text-foreground">
        {starter?.images[0] ? (
          <Image
            src={starter.images[0]}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority={false}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/25" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex max-w-xl flex-col items-start gap-4">
            <span className="flex items-center gap-2 text-sm font-semibold tracking-widest">
              <Leaf className="size-4 text-primary" />
              JINTEA
            </span>
            <Eyebrow className="text-muted-foreground">З чого почати</Eyebrow>
            <h2 className="text-3xl font-semibold text-balance sm:text-4xl">
              Сім сортів по 10 г, щоб знайти свій
            </h2>
            <p className="max-w-prose text-base text-muted-foreground text-pretty">
              Пуер, два улуни, зелений, червоний і білий — разом 70 г. З кожного виходить дві повні
              церемонії, тож сорт можна справді розпробувати, а не спробувати.
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-4">
              <Button size="lg">Зібрати набір за {uah(starter?.price ?? 570)}</Button>
              <Link href="/catalog" className="text-sm underline underline-offset-4">
                Весь каталог
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The catalogue row: the accent on the chosen tier and on the add button. */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h3 className="text-2xl font-semibold">Оберіть свій чай</h3>
          <Link href="/catalog" className="text-sm underline underline-offset-4 hover:text-primary">
            Усі товари
          </Link>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((p, i) => {
            if (!p) return null;
            const tier = p.priceTiers[0];
            const price = tier ? priceFor(p, tier.weight) : p.price;
            return (
              <article key={p.slug} className="flex flex-col gap-3 rounded-xl bg-card p-4">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-subtle">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0]}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 90vw"
                      className="object-cover"
                    />
                  ) : null}
                  {i === 0 ? (
                    <Badge variant="primary" className="absolute left-2 top-2">
                      Хіт
                    </Badge>
                  ) : null}
                </div>
                <h4 className="text-lg font-medium text-balance">{p.title}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {p.priceTiers.slice(0, 3).map((t, ti) => (
                    <WeightChip
                      key={t.weight}
                      compact
                      weight={`${t.weight} г`}
                      selected={ti === 0}
                      aria-hidden
                      tabIndex={-1}
                    />
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                  <span className="text-xl font-semibold tabular-nums">{uah(price ?? 0)}</span>
                  <Button size="sm">У кошик</Button>
                </div>
              </article>
            );
          })}

          {/* The buy block and a field, side by side with the cards, so the accent
              is judged next to a form rather than only next to photography. */}
          <div className="flex flex-col gap-5 rounded-xl bg-card p-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">
                <Check /> В наявності
              </Badge>
              <Badge variant="subtle">Урожай 2025</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['25 г', '310 ₴'],
                ['50 г', '560 ₴'],
                ['100 г', '1 040 ₴'],
              ].map(([w, pr], i) => (
                <WeightChip key={w} weight={w} price={pr} selected={i === 1} aria-hidden tabIndex={-1} />
              ))}
            </div>
            <Button className="w-full">Додати в кошик</Button>
            <InfoRows>
              <InfoRow icon={<Truck />}>
                Безкоштовна доставка від {FREE_DELIVERY_THRESHOLD} ₴
              </InfoRow>
            </InfoRows>
            <PhoneErrorField />
          </div>
        </div>
      </section>
    </div>
  );
}
