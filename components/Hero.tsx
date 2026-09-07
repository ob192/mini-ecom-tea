import Image from 'next/image';
import Link from 'next/link';
import { ArrowIcon } from './Icons';
import { HeroVideo } from './HeroVideo';
import { Eyebrow } from '@/design';

/*
  Hero — the `Hero` frame of the home screens in jintea.pen.

  A full-bleed photograph, a scrim that fades from transparent at the top to
  green-deep at 69% opacity at the bottom, and a 460px content column: amber
  eyebrow, 42px display headline, body sub, and a card-filled button. The
  desktop frame sets the column against the right edge of the 1200px content
  width; the mobile frame drops it to the bottom-left.

  The still is now the video's own first frame, with the looping clip
  (components/HeroVideo.tsx) fading in over it once it plays. Two reasons for
  that order rather than a bare <video>: the LCP element stays an image that
  next/image serves as AVIF/WebP at the right size, and every visitor who does
  not get the video — reduced motion, Save-Data, a 2g connection, refused
  autoplay — still sees a finished hero rather than a hole. Because the still is
  frame 0, the fade has nothing to cut between.

  `public/banner.jpg` is deliberately NOT used — it is a promo graphic with its
  own baked-in headline, which would collide with this one.

  Override the still with NEXT_PUBLIC_HERO_IMAGE=/your-photo.jpg — but if you
  point it away from the video, the fade becomes a visible jump.
*/
const DEFAULT_HERO = '/video/hero-poster.jpg';
const HERO_IMAGE = process.env.NEXT_PUBLIC_HERO_IMAGE || DEFAULT_HERO;

export function Hero() {
  return (
    <section className="relative flex min-h-[440px] items-end overflow-hidden lg:min-h-[600px]">
      <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover" />
      <HeroVideo />

      {/*
        Two scrims. The design's is vertical (--scrim-from -> --scrim-to); the
        second darkens the right-hand side on desktop, where the text column
        sits, so the headline keeps its contrast whatever photo is configured.

        They are held at half strength by the wrapper. The stack was tuned for
        a still photograph, and over moving footage it read as a green wash
        laid over the video rather than light on it. Halving here rather than
        in the gradients themselves keeps one number to turn, and keeps
        `--scrim-from` / `--scrim-to` at the values the design file exports —
        those are tokens, mirrored in three places and pinned by
        tests/design-tokens.test.ts, so editing them to retune one section
        would push the change onto every future consumer of the token.
      */}
      <div className="absolute inset-0 opacity-50">
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
      </div>

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
            href="/catalog"
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
