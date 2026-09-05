import Image from 'next/image';
import Link from 'next/link';
import { Eyebrow } from '@/design';

/*
  DiscoverBanner — the `Discover Banner` frame of the home screen: a full-bleed
  photograph under a flat green scrim, with centred copy and an outlined
  button.

  The scrim is a solid #23372699 rather than a gradient — the copy is centred
  here, not anchored to one edge, so it needs even coverage.

  It links to /about, which is the story the button promises. The mockup's
  photograph is stock we do not own; this uses a catalogue photo until there is
  purpose-shot imagery.
*/
export function DiscoverBanner() {
  return (
    <section className="relative flex min-h-[360px] items-center overflow-hidden lg:min-h-[460px]">
      <Image
        src="/puer/seven-sons-shu/1.jpg"
        alt=""
        fill
        sizes="100vw"
        /* Portrait source: bias the crop upward so the cake and the tapestry
           behind it stay in frame rather than a band of bare texture. */
        className="object-cover object-[center_28%]"
      />
      <div className="absolute inset-0" style={{ background: '#23372699' }} />

      <div className="relative z-[1] mx-auto flex max-w-[720px] flex-col items-center gap-5 px-5 text-center">
        <Eyebrow tone="on-green" className="tracking-[2.5px]">
          Філософія чаю
        </Eyebrow>

        <h2 className="m-0 font-display text-[30px] font-semibold leading-[1.15] text-on-green lg:text-[40px]">
          Відкрийте світ китайського чаю
        </h2>

        <Link
          href="/about"
          className="inline-flex items-center gap-2 rounded px-[26px] py-[13px] font-body text-label uppercase text-on-green shadow-[inset_0_0_0_1px_var(--on-green)] transition-colors hover:bg-on-green hover:text-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-green"
        >
          Читати історію
        </Link>
      </div>
    </section>
  );
}
