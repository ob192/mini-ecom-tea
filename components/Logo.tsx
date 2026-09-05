import Image from 'next/image';
import { tone } from '@/lib/products';
import { LeafIcon } from './Icons';
import { BRAND_NAME } from '@/lib/contacts';

/*
  Logo — the `Logo` group used in the header and footer of every frame in
  jintea.pen: a green leaf beside the wordmark in the display face at 22px,
  600, with 3px of tracking. The mobile frames draw it at 19px/2.5px; that is
  the `sm` size.

  `tone` inverts it for the green footer.
*/
export function Logo({
  size = 'md',
  tone: t = 'ink',
}: {
  size?: 'sm' | 'md';
  tone?: 'ink' | 'on-green';
}) {
  const glyph = size === 'sm' ? 18 : 22;

  return (
    <span className="flex items-center gap-2">
      <span className={t === 'ink' ? 'flex text-green' : 'flex text-on-green'} aria-hidden>
        <LeafIcon width={glyph} height={glyph} />
      </span>
      <span
        className={`whitespace-nowrap font-display font-semibold leading-none ${
          t === 'ink' ? 'text-ink' : 'text-on-green'
        }`}
        style={{
          fontSize: size === 'sm' ? 19 : 22,
          letterSpacing: size === 'sm' ? '2.5px' : '3px',
        }}
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
        <LeafIcon width="42%" height="42%" />
      </div>
      {tag ? (
        <span
          className="relative z-[1] m-2 rounded-sm px-[7px] py-[3px] font-body text-[10px] tracking-wide"
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
export { QtyStepper as Stepper } from '@/design/primitives/QtyStepper';
