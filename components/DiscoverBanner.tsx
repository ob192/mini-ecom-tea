import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';

/*
  DiscoverBanner — a full-bleed photograph under a scrim, with centred copy.

  It is a **dark block**: `dark` on the section switches the semantic tokens to
  their dark values inside it, so the copy is `text-foreground`, the eyebrow
  `text-muted-foreground` and the scrim `bg-background/70` — no raw colour, no
  `primary-foreground` standing in for "white". That mattered: with the brand
  direction still open, `primary-foreground` is white in one direction and ink
  in another, and the second would have put near-black text on a dark
  photograph. Any band of imagery with text over it is a dark block.

  The scrim is flat rather than a gradient because the copy is centred, not
  anchored to an edge, so it needs even coverage.

  It links to /about, which is the story the button promises. The mockup's
  photograph is stock we do not own; this uses a catalogue photo until there is
  purpose-shot imagery.
*/
export function DiscoverBanner() {
  return (
    <section className="dark relative flex min-h-90 items-center overflow-hidden text-foreground lg:min-h-115">
      <Image
        src="/puer/seven-sons-shu/1.jpg"
        alt=""
        fill
        sizes="100vw"
        /* Portrait source: bias the crop upward so the cake and the tapestry
           behind it stay in frame rather than a band of bare texture. */
        className="object-cover object-[center_28%]"
      />
      <div className="absolute inset-0 bg-background/70" />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-14 text-center sm:px-6 lg:px-8">
        <Eyebrow className="text-muted-foreground">Філософія чаю</Eyebrow>

        <h2 className="text-3xl font-semibold text-balance lg:text-4xl">
          Відкрийте світ китайського чаю
        </h2>

        <Button asChild variant="outline" className="mt-2">
          <Link href="/about">Читати історію</Link>
        </Button>
      </div>
    </section>
  );
}
