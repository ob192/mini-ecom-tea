import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { HeroVideo } from "@/components/HeroVideo";

/*
  Three home heroes, all leading with the starter set.

  Shared ground, so the comparison is about composition and not about content:

  - Real copy from `set/start-mini-7` in public/products.json — «Набір «Старт
    МІНІ», 7 видів по 10 г», 570 ₴, 70 г, and the seven teas by name. Written
    into the markup, as an exploration should be.
  - The video contract is kept in all three: the poster is a separate
    `next/image`, it is the video's frame 0, it is the LCP element, and
    `HeroVideo` attaches its sources only after checking reduced motion,
    Save-Data and the connection. A visitor excluded from the clip sees a
    finished hero.
  - Any band of imagery with text over it is a `dark` block, so the copy is
    `text-foreground` and the scrim `bg-background` at an opacity. Never
    `text-primary-foreground` — amber's partner is ink, and ink on a dark
    photograph is unreadable.
  - One `h1`, one filled button.

  The promo banner in media/reference is the reference for the offer's tone
  only. It is not shipped: a headline baked into pixels collides with the page's
  own, cannot be translated, cannot be read aloud and cannot be the LCP element
  at a sensible size.
*/

const SET_HREF = "/product/set/start-mini-7";
const POSTER = "/video/hero-poster.jpg";
const SET_PHOTO = "/set/start-mini-7/1.jpg";

const SEVEN = [
  "Габа Наполеон",
  "Шу пуер Цзінмай Цяому 2016",
  "Зелений Лунцзин, весна 2025",
  "Червоний Дянь Хун",
  "Білий Шоу Мей",
  "Улун Те Гуань Інь",
  "Улун Да Хун Пао Жоу Гуй",
];

/* ── 1 ───────────────────────────────────────────────────────────────────── */
/**
 * Over the footage. The film is the whole first screen and the offer is laid
 * over it as live type, anchored low-left on phones and in a right-hand column
 * from `lg` — which is where the new footage is darkest.
 */
export function HeroOverFootage() {
  return (
    <section className="dark relative flex min-h-110 items-end overflow-hidden text-foreground md:min-h-130 lg:min-h-150">
      <Image
        src={POSTER}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <HeroVideo />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
      <div className="absolute inset-0 hidden bg-gradient-to-l from-background/90 via-background/35 to-transparent lg:block" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-24">
        <div className="flex flex-col items-start gap-4 lg:ml-auto lg:max-w-md">
          <Eyebrow className="text-muted-foreground">З чого почати</Eyebrow>

          <h1 className="text-3xl font-semibold text-balance sm:text-4xl lg:text-5xl">
            Сім сортів по 10 г, щоб знайти свій
          </h1>

          <p className="max-w-prose text-base text-muted-foreground text-pretty">
            Пуер, два улуни, зелений, червоний і білий — разом 70 г. З кожного
            виходить дві повні церемонії, тож сорт можна розпробувати, а не
            спробувати.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button asChild size="lg">
              <Link href={SET_HREF}>
                Зібрати набір за 570 ₴
                <ArrowRight />
              </Link>
            </Button>
            <Link
              href="/catalog"
              className="text-sm underline underline-offset-4"
            >
              Весь каталог
            </Link>
          </div>

          <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="size-4" />
            Доставка безкоштовна — набір дорожчий за 500 ₴
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── 2 ───────────────────────────────────────────────────────────────────── */
/**
 * Split band. The offer stops being prose over a picture and becomes a
 * structured block — what is in the box, the price, the action — on the page
 * colour of the dark block, with the film filling the other half. On a phone
 * the film is a strip above it, so the first screen still shows the price and
 * the button.
 */
export function HeroSplit() {
  return (
    /*
      Full width, not a container-width grid. With the grid capped at the
      container the photograph stopped 144px short of the screen edge at 1440
      while the dark band ran on past it — media that misses both edges (V6).
      The band bleeds, the film bleeds, and the copy is brought back onto the
      container's left edge by the half-container cap on its own column.
    */
    <section className="dark bg-background text-foreground">
      <div className="grid w-full items-stretch lg:grid-cols-2">
        {/* The film. Order matters on phones: a strip of it, then the offer. */}
        <div className="relative order-1 min-h-55 overflow-hidden sm:min-h-70 md:min-h-80 lg:order-2 lg:min-h-150">
          <Image
            src={POSTER}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <HeroVideo />
          {/* The seam between the film and the block, so the edge is not a hard cut. */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent lg:bg-gradient-to-r" />
        </div>

        <div className="order-2 flex lg:order-1 lg:justify-end">
          {/* Below `lg` this is the ordinary container, centred; from `lg` it is
              half of it, pushed right so its left edge lands exactly on the
              container's. Right-aligning it at every width left the copy
              floating in the middle of a tablet. */}
          <div className="mx-auto flex w-full max-w-6xl flex-col justify-center gap-5 px-4 py-10 sm:px-6 lg:mx-0 lg:max-w-144 lg:py-20 lg:pr-12 lg:pl-8">
            <Eyebrow className="text-muted-foreground">З чого почати</Eyebrow>
            <h1 className="text-3xl font-semibold text-balance sm:text-4xl">
              Набір «Старт МІНІ»
            </h1>
            <p className="max-w-prose text-base text-muted-foreground text-pretty">
              Сім сортів по 10 г, разом 70 г. З кожного виходить дві повні
              церемонії на 100–120 мл.
            </p>

            <ul className="flex list-none flex-wrap gap-x-4 gap-y-1.5">
              {SEVEN.map((t) => (
                <li
                  key={t}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <Check className="size-3.5 text-primary" />
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-5">
              <span className="text-3xl font-semibold tabular-nums">570 ₴</span>
              <Button asChild size="lg">
                <Link href={SET_HREF}>
                  Замовити набір
                  <ArrowRight />
                </Link>
              </Button>
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="size-4" />
                Доставка безкоштовна
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 3 ───────────────────────────────────────────────────────────────────── */
/**
 * Light shelf. The first screen is the cream page, not a dark band: copy on the
 * left, the film in a framed panel on the right, and three proof chips laid
 * over its edge. The dark block moves down the page, so the site opens calm and
 * the film is something you look *at* rather than something you read *over*.
 */
export function HeroLightShelf() {
  return (
    <section className="bg-background py-10 lg:py-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-12 lg:px-8">
        <div className="flex flex-col items-start gap-4">
          <Eyebrow className="text-muted-foreground">З чого почати</Eyebrow>
          <h1 className="text-3xl font-semibold text-balance sm:text-4xl lg:text-5xl">
            Сім сортів по 10 г, щоб знайти свій
          </h1>
          <p className="max-w-prose text-base text-muted-foreground text-pretty">
            Пуер, два улуни, зелений, червоний і білий — разом 70 г. З кожного
            виходить дві повні церемонії, тож сорт можна розпробувати, а не
            спробувати.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button asChild size="lg">
              <Link href={SET_HREF}>
                Зібрати набір за 570 ₴
                <ArrowRight />
              </Link>
            </Button>
            <Link
              href="/catalog"
              className="text-sm underline underline-offset-4 hover:text-primary"
            >
              Весь каталог
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-card lg:aspect-3/2">
            <Image
              src={POSTER}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
            <HeroVideo />
          </div>

          {/*
            Proof chips over the panel's edge, not floating in the middle of the
            picture: they straddle it near the middle of their own height and
            keep clear of the copy. On a phone they sit under the panel, where
            there is no edge wide enough to straddle without covering the film.
          */}
          <ul className="mt-3 flex list-none flex-wrap gap-2 lg:absolute lg:-bottom-4 lg:left-6 lg:mt-0">
            {[
              ["7 сортів", "10 г кожного"],
              ["70 г", "разом"],
              ["Доставка", "безкоштовна"],
            ].map(([head, tail]) => (
              <li
                key={head}
                className="flex items-baseline gap-1.5 rounded-full bg-card px-3.5 py-2 text-sm shadow-xl"
              >
                <span className="font-semibold">{head}</span>
                <span className="text-muted-foreground">{tail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* Shown under variant 3 so the comparison is honest: it moves the dark band
   down the page rather than removing it. */
export function HeroLightShelfSecondBand() {
  return (
    <section className="dark relative flex min-h-70 items-end overflow-hidden text-foreground lg:min-h-90">
      <Image
        src={SET_PHOTO}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-10 sm:px-6 lg:px-8">
        <Badge variant="primary" className="self-start">
          Наступна секція
        </Badge>
        <h2 className="max-w-xl text-2xl font-semibold text-balance sm:text-3xl">
          Темна смуга лишається — вона просто нижче
        </h2>
      </div>
    </section>
  );
}
