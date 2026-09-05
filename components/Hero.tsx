import Image from 'next/image';
import Link from 'next/link';
import { ArrowIcon } from './Icons';
import { Eyebrow } from '@/design';

/*
  Hero — the `Hero` frame of the home screens in jintea.pen.

  A full-bleed photograph, a scrim that fades from transparent at the top to
  green-deep at 69% opacity at the bottom, and a 460px content column: amber
  eyebrow, 42px display headline, body sub, and a card-filled button. The
  desktop frame sets the column against the right edge of the 1200px content
  width; the mobile frame drops it to the bottom-left.

  The design assumes a photograph, and with none set the section rendered as a
  640px slab of flat green — the single worst thing on the page. It now falls
  back to a catalogue photo that suits the treatment: a dark tea table with the
  subject on the left, so the right-hand text column lands on dark pixels.
  `public/banner.jpg` is deliberately NOT used — it is a promo graphic with its
  own baked-in headline, which would collide with this one.

  Override it with NEXT_PUBLIC_HERO_IMAGE=/your-photo.jpg once a purpose-shot
  banner exists.
*/
const DEFAULT_HERO = '/teapot/jianshui-180ml/1.jpg';
const HERO_IMAGE = process.env.NEXT_PUBLIC_HERO_IMAGE || DEFAULT_HERO;

export function Hero() {
  return (
    <section className="relative flex min-h-[440px] items-end overflow-hidden lg:min-h-[600px]">
      <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover" />

      {/*
        Two scrims. The design's is vertical (--scrim-from -> --scrim-to); the
        second darkens the right-hand side on desktop, where the text column
        sits, so the headline keeps its contrast whatever photo is configured.
      */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, var(--scrim-from), var(--scrim-to))' }}
      />
      <div
        className="absolute inset-0 lg:hidden"
        style={{ background: 'linear-gradient(to top, #233726E6 20%, #23372633 75%)' }}
      />
      <div
        className="absolute inset-0 hidden lg:block"
        style={{ background: 'linear-gradient(to left, #233726E6 28%, #23372600 70%)' }}
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
