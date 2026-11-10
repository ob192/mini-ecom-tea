import Image from 'next/image';
import { tone } from '@/lib/products';
import { Leaf } from 'lucide-react';
import { BRAND_NAME } from '@/lib/contacts';

/*
  Logo — a leaf beside the wordmark, in the header and the footer.

  It sets no surface and no text colour: the leaf is the one text use of the
  brand hue the system allows (it is the brand mark — C5), and the wordmark
  inherits whatever surface it sits on, so the same component works on the page,
  on a card and inside the footer's dark block with nothing passed (C2). That is
  why the old `tone` prop is gone.

  The wordmark is the one place tracking is set by hand: letter-spaced caps are
  what makes four letters read as a mark rather than as a word.
*/
export function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span className="flex items-center gap-2">
      {/* The one `text-primary` left on a light surface. Amber is 2.8:1 against
          the page, under the 3:1 a meaningful graphic needs — but this is part
          of a logo, which WCAG 1.4.11 exempts, and the wordmark beside it
          carries the name at 16.9:1. Nothing else may copy this. */}
      <Leaf className={size === 'sm' ? 'size-4 text-primary' : 'size-5 text-primary'} />
      <span
        className={`whitespace-nowrap font-semibold tracking-widest ${
          size === 'sm' ? 'text-lg' : 'text-xl'
        }`}
      >
        {BRAND_NAME.toUpperCase()}
      </span>
    </span>
  );
}

/**
 * Product image with a branded placeholder when `src` is empty.
 * `priority` lifts mobile LCP for above-the-fold images.
 */
export function ProductImage({
  src,
  category,
  alt,
  ratio = '1 / 1',
  radius = 0,
  tag = 'фото товару',
  priority = false,
  sizes = '(max-width: 480px) 50vw, 240px',
}: {
  src?: string;
  category: string;
  alt: string;
  ratio?: string;
  radius?: number;
  tag?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const t = tone(category);

  if (src) {
    return (
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: ratio, borderRadius: radius }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  // Empty image → branded gradient placeholder.
  return (
    <div
      className="relative flex w-full items-end overflow-hidden"
      role="img"
      aria-label={alt}
      style={{
        aspectRatio: ratio,
        borderRadius: radius,
        background: `linear-gradient(150deg, ${t.a}, ${t.b})`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'repeating-linear-gradient(135deg, rgba(255,255,255,0.16) 0 2px, transparent 2px 11px)',
        }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ color: 'rgba(255,255,255,0.30)' }}
      >
        <Leaf width="42%" height="42%" />
      </div>
      {tag ? (
        <span
          className="relative z-10 m-2 rounded-sm px-2 py-1 text-xs tracking-wide"
          style={{ color: 'rgba(255,255,255,0.82)', background: 'rgba(0,0,0,0.18)' }}
        >
          {tag}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Quantity stepper.
 *
 * The control itself moved into the design system with the jintea.pen design
 * (design/primitives/QtyStepper.tsx). Re-exported here because the cart rows
 * import it from this module.
 */
