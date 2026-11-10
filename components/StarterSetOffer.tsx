import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Truck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { getProduct } from '@/lib/products';
import { uah } from '@/lib/format';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/shipping';

/*
  StarterSetOffer — «Коробка», the owner's choice from /playground/offer on
  2026-11-10. A quiet band: the set's photograph on one side, the seven teas
  listed on the other, price and action under them. It reads as a section of the
  page rather than an advert, which is why it can sit on the home page under the
  rail without competing with the hero.

  The copy is the set's own catalogue entry. The price and the free-delivery
  line are read from `public/products.json` and `lib/shipping.ts` rather than
  written out, so the band cannot promise a price the cart will not honour.

  Two things from the promo graphic in media/reference are deliberately not
  here, both decided by the owner on 2026-11-10:

  1. Its free-delivery-for-an-Instagram-follow offer is gone. The set is 570 ₴
     and the threshold is 500, so delivery was already free — the offer promised
     what the buyer had anyway. The band says plainly that it ships free, and
     only while the price really clears the threshold.
  2. Its "JinTea" spelling is not adopted. `BRAND_NAME` stays "Jintea", which is
     what the Merchant Center feed's `g:brand`, the Organization JSON-LD and
     every page title publish; the graphic is the cheaper thing to change.
*/

const HREF = '/product/set/start-mini-7';
const PHOTO = '/set/start-mini-7/1.jpg';

/** The seven teas and the tasting notes from the set's own description. */
const TEAS: [string, string][] = [
  ['Шу пуер Цзінмай Цяому 2016', 'оксамитова солодкість, фініки'],
  ['Зелений Лунцзин, весна 2025', 'грейпфрут, насіння, чиста зелень'],
  ['Улун Те Гуань Інь 5', 'квітковість, лимонад'],
  ['Улун Да Хун Пао Жоу Гуй', 'пропеченість, молодий мед, сила'],
  ['Червоний Дянь Хун', 'какао, шоколадне печиво, гречаний мед'],
  ['Габа Наполеон', 'солодкий, пряний'],
  ['Білий Шоу Мей', 'квітковий, медовий'],
];

export function StarterSetOffer() {
  const set = getProduct('set/start-mini-7');
  const price = set?.price ?? 570;
  const shipsFree = price >= FREE_DELIVERY_THRESHOLD;

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
            <span className="text-3xl font-semibold tabular-nums">{uah(price)}</span>
            <Button asChild size="lg">
              <Link href={HREF}>
                Замовити набір
                <ArrowRight />
              </Link>
            </Button>
          </div>
          {shipsFree ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="size-4" />
              Доставка безкоштовна — набір дорожчий за {FREE_DELIVERY_THRESHOLD} ₴
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
