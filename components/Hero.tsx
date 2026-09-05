import Image from 'next/image';
import Link from 'next/link';
import { ArrowIcon, LeafIcon } from './Icons';
import { Eyebrow } from '@/design';

/*
  Hero — the `Hero` frame of the home screens in jintea.pen.

  A full-bleed photograph, a scrim that fades from transparent at the top to
  green-deep at 69% opacity at the bottom, and a 460px content column: amber
  eyebrow, 42px display headline, body sub, and a card-filled button. The
  desktop frame sets the column against the right edge of the 1200px content
  width; the mobile frame drops it to the bottom-left.

  To use a custom banner image:
  1. Put the file in /public (e.g. /public/hero.jpg).
  2. Set NEXT_PUBLIC_HERO_IMAGE=/hero.jpg in your .env.
  With no value set, the green gradient fallback below is used — the design
  assumes a photo, so set one in production.
*/
const HERO_IMAGE = process.env.NEXT_PUBLIC_HERO_IMAGE || '';

export function Hero() {
  return (
    <section className="relative flex min-h-[420px] items-end overflow-hidden lg:min-h-[640px]">
      {HERO_IMAGE ? (
        <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover" />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(155deg, #3E5A41, #233726 70%)' }}
          />
          <div
            className="absolute -right-8 top-10 -rotate-12 lg:right-[6%] lg:top-1/2 lg:-translate-y-1/2"
            style={{ color: 'rgba(243,236,221,0.10)' }}
          >
            <LeafIcon className="h-[260px] w-[260px] lg:h-[420px] lg:w-[420px]" />
          </div>
        </>
      )}

      {/* Scrim: --scrim-from at the top, --scrim-to at the bottom. */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, var(--scrim-from), var(--scrim-to))' }}
      />

      <div className="relative z-[1] mx-auto w-full max-w-content px-5 pb-12 lg:px-8 lg:pb-24">
        <div className="flex flex-col gap-5 lg:ml-auto lg:max-w-[460px]">
          <Eyebrow tone="on-green">Сезон пуеру відкрито</Eyebrow>

          <h1 className="m-0 font-display text-[34px] font-semibold leading-[1.12] text-on-green lg:text-display">
            Прямо з гір Юньнані до вашої чашки
          </h1>

          <p className="m-0 max-w-[46ch] font-body text-body text-on-green/80">
            Витриманий шу та живий шен пуер, зібраний зі старих чайних дерев.
          </p>

          <Link
            href="#catalog"
            className="inline-flex w-fit items-center gap-2 rounded bg-card px-7 py-[14px] font-body text-label uppercase text-ink transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-green"
          >
            Переглянути каталог
            <ArrowIcon width={15} height={15} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
