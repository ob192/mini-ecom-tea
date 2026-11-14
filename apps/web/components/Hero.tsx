import Image from 'next/image';
import Link from 'next/link';
import { Check, Truck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { getProduct } from '@/lib/products';
import { uah } from '@/lib/format';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/shipping';
import { HeroVideo } from './HeroVideo';

/*
  Hero — the home page's first screen, leading with the starter set
  («Розділена смуга», the owner's choice from /playground/hero on 2026-11-10).

  The offer is a block rather than a sentence: the seven teas by name, the price
  beside the button. On a phone the film is a strip above it, so the price and
  the action are both on the first screen — which is the whole point, given the
  site took no mobile orders at all over the 90 days to 2026-09-07.

  It is a **dark block**: `dark` on the section switches every semantic token
  inside it, so the copy is `text-foreground`, the lead `text-muted-foreground`
  and the seam gradient `bg-background` at an opacity. Never
  `text-primary-foreground` for "white" — the brand's partner is ink.

  The still is the video's own first frame, with the looping clip
  (components/HeroVideo.tsx) fading in over it once it plays. Two reasons for
  that order rather than a bare <video>: the LCP element stays an image that
  next/image serves as AVIF/WebP at the right size, and every visitor who does
  not get the video — reduced motion, Save-Data, a 2g connection, refused
  autoplay — still sees a finished hero rather than a hole. Because the still is
  frame 0, the fade has nothing to cut between. Do not replace the poster with a
  different photograph.

  `public/banner.jpg` is deliberately NOT used — it is a promo graphic with its
  own baked-in headline, which would collide with this one, cannot be
  translated, cannot be read by a screen reader and cannot be the LCP element at
  a sensible size.

  Override the still with NEXT_PUBLIC_HERO_IMAGE=/your-photo.jpg — but if you
  point it away from the video, the fade becomes a visible jump.
*/
const DEFAULT_HERO = '/video/hero-poster.jpg';
const HERO_IMAGE = process.env.NEXT_PUBLIC_HERO_IMAGE || DEFAULT_HERO;

const STARTER_SLUG = 'set/start-mini-7';

/** The seven teas, from the set's own catalogue entry. */
const SEVEN = [
  'Габа Наполеон',
  'Шу пуер Цзінмай Цяому 2016',
  'Зелений Лунцзин, весна 2025',
  'Червоний Дянь Хун',
  'Білий Шоу Мей',
  'Улун Те Гуань Інь',
  'Улун Да Хун Пао Жоу Гуй',
];

export function Hero() {
  const starter = getProduct(STARTER_SLUG);
  const price = starter?.price ?? 570;
  const href = starter ? `/product/${starter.slug}` : '/catalog';
  const shipsFree = price >= FREE_DELIVERY_THRESHOLD;

  return (
    <section className="dark bg-background text-foreground">
      {/*
        Full width, not a container-width grid: with the grid capped at the
        container the film stopped short of the screen edge while the band ran
        past it. The band bleeds, the film bleeds, and the copy is brought back
        onto the container's left edge by the half-container cap on its column.
      */}
      <div className="grid w-full items-stretch lg:grid-cols-2">
        {/* Order matters on phones: a strip of film, then the offer. */}
        <div className="relative order-1 min-h-55 overflow-hidden sm:min-h-70 md:min-h-80 lg:order-2 lg:min-h-150">
          <Image src={HERO_IMAGE} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          <HeroVideo />
          {/* The seam between the film and the block, so the edge is not a hard cut. */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent lg:bg-gradient-to-r" />
        </div>

        <div className="order-2 flex lg:order-1 lg:justify-end">
          {/* Below `lg` this is the ordinary container; from `lg` it is half of
              it, pushed right so its left edge lands on the container's. */}
          <div className="mx-auto flex w-full max-w-6xl flex-col justify-center gap-5 px-4 py-10 sm:px-6 lg:mx-0 lg:max-w-144 lg:py-20 lg:pr-12 lg:pl-8">
            <Eyebrow className="text-muted-foreground">З чого почати</Eyebrow>

            <h1 className="text-3xl font-semibold text-balance sm:text-4xl">
              Набір «Старт МІНІ»
            </h1>

            <p className="max-w-prose text-base text-muted-foreground text-pretty">
              Сім сортів по 10 г, разом 70 г. З кожного виходить дві повні церемонії на 100–120 мл.
            </p>

            <ul className="flex list-none flex-wrap gap-x-4 gap-y-1.5">
              {SEVEN.map((tea) => (
                <li key={tea} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  {/* Inside the dark block, so amber is 6.6:1 here. It is 2.8:1
                      on the light page — see DESIGN.md. */}
                  <Check className="size-3.5 text-primary" />
                  {tea}
                </li>
              ))}
            </ul>

            <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-5">
              <span className="text-3xl font-semibold tabular-nums">{uah(price)}</span>
              <Button asChild size="lg">
                <Link href={href}>Замовити набір</Link>
              </Button>
              {shipsFree ? (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="size-4" />
                  Доставка безкоштовна
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
