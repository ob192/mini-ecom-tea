import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Truck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/shipping';

/*
  The starter-set offer block, for use further down the home page and anywhere
  else the set should be put in front of someone.

  Copy is the catalogue entry for `set/start-mini-7`: seven teas by name with
  the tasting notes the supplier sheet gives, 70 г in all, 570 ₴, and the fact
  that 10 г is two full ceremonies. The photograph is the set's own.

  Two things from the promo banner in media/reference are deliberately **not**
  reproduced, and the owner should decide what to do about them:

  1. It offers free delivery for an Instagram follow. The set is 570 ₴ and
     `FREE_DELIVERY_THRESHOLD` is 500, so the order already ships free — the
     offer promises something the buyer has anyway.
  2. It writes the brand as "JinTea". `BRAND_NAME` is "Jintea", and that
     spelling is what Merchant Center, the Organization JSON-LD and every page
     title publish.
*/

const HREF = '/product/set/start-mini-7';
const PHOTO = '/set/start-mini-7/1.jpg';
const PRICE = '570 ₴';

const TEAS: [string, string][] = [
  ['Шу пуер Цзінмай Цяому 2016', 'оксамитова солодкість, фініки'],
  ['Зелений Лунцзин, весна 2025', 'грейпфрут, насіння, чиста зелень'],
  ['Улун Те Гуань Інь 5', 'квітковість, лимонад'],
  ['Улун Да Хун Пао Жоу Гуй', 'пропеченість, молодий мед, сила'],
  ['Червоний Дянь Хун', 'какао, шоколадне печиво, гречаний мед'],
  ['Габа Наполеон', 'солодкий, пряний'],
  ['Білий Шоу Мей', 'квітковий, медовий'],
];

/* ── 1 ───────────────────────────────────────────────────────────────────── */
/** The box. A quiet band: the photograph on one side, the seven teas listed on
 *  the other, price and action under them. Editorial, and it reads as a page
 *  section rather than an advert. */
export function OfferBox() {
  return (
    <section className="bg-subtle py-14 md:py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-card">
          <Image
            src={PHOTO}
            alt="Набір «Старт МІНІ»: сім пакетів чаю по 10 г"
            fill
            sizes="(min-width: 1024px) 34rem, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col items-start gap-4">
          <Eyebrow className="text-muted-foreground">З чого почати</Eyebrow>
          <h2 className="text-2xl font-semibold text-balance sm:text-3xl">
            Набір «Старт МІНІ» — сім сортів по 10 г
          </h2>
          <p className="max-w-prose text-base text-muted-foreground text-pretty">
            Разом 70 г. З кожного виходить дві повні церемонії на 100–120 мл, тож сорт можна
            розпробувати, а не спробувати.
          </p>

          <ul className="grid list-none gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {TEAS.map(([name]) => (
              <li key={name} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-pretty">{name}</span>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="text-3xl font-semibold tabular-nums">{PRICE}</span>
            <Button asChild size="lg">
              <Link href={HREF}>
                Замовити набір
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="size-4" />
            Доставка безкоштовна — від {FREE_DELIVERY_THRESHOLD} ₴
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── 2 ───────────────────────────────────────────────────────────────────── */
/** Seven cups. The teas lead, not the box: each one a tile with its tasting
 *  note, the photograph reduced to a header, and one action under the row. */
export function OfferSevenCups() {
  return (
    <section className="bg-background py-14 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="flex max-w-xl flex-col gap-3">
            <Eyebrow className="text-muted-foreground">З чого почати</Eyebrow>
            <h2 className="text-2xl font-semibold text-balance sm:text-3xl">
              Сім сортів по 10 г — по дві церемонії з кожного
            </h2>
            <p className="max-w-prose text-base text-muted-foreground text-pretty">
              Набір «Старт МІНІ»: пуер, два улуни, зелений, червоний і білий. Разом 70 г.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-semibold tabular-nums">{PRICE}</span>
            <Button asChild size="lg">
              <Link href={HREF}>
                Замовити
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>

        <ul className="mt-8 grid list-none gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <li className="relative row-span-2 hidden overflow-hidden rounded-xl bg-card lg:block">
            <Image
              src={PHOTO}
              alt="Набір «Старт МІНІ»: сім пакетів чаю по 10 г"
              fill
              sizes="18rem"
              className="object-cover"
            />
          </li>
          {TEAS.map(([name, note]) => (
            <li key={name} className="flex flex-col gap-1 rounded-xl bg-card p-4">
              <span className="text-base font-medium text-pretty">{name}</span>
              <span className="text-sm text-muted-foreground text-pretty">{note}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Truck className="size-4" />
          Доставка безкоштовна — від {FREE_DELIVERY_THRESHOLD} ₴
        </p>
      </div>
    </section>
  );
}

/* ── 3 ───────────────────────────────────────────────────────────────────── */
/** Narrow inset. Not a band at all — one card that drops into the ordinary flow
 *  of a page: the catalogue grid, the empty cart, under a product. */
export function OfferInset() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-xl bg-card p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-subtle sm:aspect-square sm:w-40">
          <Image
            src={PHOTO}
            alt="Набір «Старт МІНІ»: сім пакетів чаю по 10 г"
            fill
            sizes="(min-width: 640px) 10rem, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="subtle">З чого почати</Badge>
            <Badge variant="success">
              <Check /> Доставка безкоштовна
            </Badge>
          </div>
          <h2 className="text-xl font-semibold text-balance">
            Не знаєте, з чого почати? Сім сортів по 10 г
          </h2>
          <p className="max-w-prose text-sm text-muted-foreground text-pretty">
            Пуер, два улуни, зелений, червоний і білий — разом 70 г, по дві церемонії з кожного.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          <span className="text-2xl font-semibold tabular-nums">{PRICE}</span>
          <Button asChild className="flex-1 sm:flex-none">
            <Link href={HREF}>
              Замовити
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
