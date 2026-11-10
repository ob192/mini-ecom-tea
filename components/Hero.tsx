import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { HeroVideo } from './HeroVideo';

/*
  Hero — the home page's first screen.

  It is a **dark block**: `dark` on the section switches every semantic token
  inside it, so the copy is `text-foreground`, the lead `text-muted-foreground`
  and both scrims are `bg-background` at an opacity. Before that it carried
  `var(--scrim-from)` / `var(--scrim-to)`, tokens the Pencil export used to
  declare — once that file was deleted the gradient quietly became transparent
  to transparent, which is a scrim that is not there. (The design-system audit
  now reads `var()` out of inline styles for exactly this reason.)

  The still is the video's own first frame, with the looping clip
  (components/HeroVideo.tsx) fading in over it once it plays. Two reasons for
  that order rather than a bare <video>: the LCP element stays an image that
  next/image serves as AVIF/WebP at the right size, and every visitor who does
  not get the video — reduced motion, Save-Data, a 2g connection, refused
  autoplay — still sees a finished hero rather than a hole. Because the still is
  frame 0, the fade has nothing to cut between. Do not replace the poster with a
  different photograph.

  `public/banner.jpg` is deliberately NOT used — it is a promo graphic with its
  own baked-in headline, which would collide with this one.

  Override the still with NEXT_PUBLIC_HERO_IMAGE=/your-photo.jpg — but if you
  point it away from the video, the fade becomes a visible jump.
*/
const DEFAULT_HERO = '/video/hero-poster.jpg';
const HERO_IMAGE = process.env.NEXT_PUBLIC_HERO_IMAGE || DEFAULT_HERO;

export function Hero() {
  return (
    <section className="dark relative flex min-h-110 items-end overflow-hidden text-foreground lg:min-h-150">
      <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover" />
      <HeroVideo />

      {/*
        Two scrims, both the page colour of the dark block. The vertical one
        carries the copy on phones, where it sits at the bottom; the second
        darkens the right-hand half from `lg`, where the column moves. Neither
        is at full strength: the stack was tuned for a still photograph, and
        over moving footage a solid wash reads as a sheet laid on the video
        rather than as light in it.
      */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
      <div className="absolute inset-0 hidden bg-gradient-to-l from-background/90 via-background/35 to-transparent lg:block" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-24">
        <div className="flex flex-col items-start gap-4 lg:ml-auto lg:max-w-md">
          <Eyebrow className="text-muted-foreground">Сезон пуеру відкрито</Eyebrow>

          <h1 className="text-3xl font-semibold text-balance sm:text-4xl lg:text-5xl">
            Прямо з гір Юньнані до вашої чашки
          </h1>

          <p className="max-w-prose text-base text-muted-foreground text-pretty">
            Витриманий шу та живий шен пуер, зібраний зі старих чайних дерев.
          </p>

          <Button asChild size="lg" className="mt-2">
            <Link href="/catalog">
              Переглянути каталог
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
