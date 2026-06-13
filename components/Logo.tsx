import Image from 'next/image';
import { tone } from '@/lib/products';
import { LeafIcon, MinusIcon, PlusIcon } from './Icons';

export function Logo({ size = 19 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex text-green" aria-hidden>
        <LeafIcon width={size + 4} height={size + 4} />
      </span>
      <span
        className="font-display font-semibold text-ink leading-none whitespace-nowrap"
        style={{ fontSize: size, letterSpacing: '0.14em' }}
      >
        TEA CHE
      </span>
    </span>
  );
}

/**
 * Product image with a tasteful striped placeholder when `src` is empty.
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
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  // Empty image → branded gradient placeholder.
  return (
    <div
      className="relative w-full overflow-hidden flex items-end"
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
      <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'rgba(255,255,255,0.30)' }}>
        <LeafIcon width="42%" height="42%" />
      </div>
      {tag ? (
        <span
          className="relative z-[1] font-mono text-[10px] tracking-wide m-2 px-[7px] py-[3px] rounded-md"
          style={{ color: 'rgba(255,255,255,0.82)', background: 'rgba(0,0,0,0.18)' }}
        >
          {tag}
        </span>
      ) : null}
    </div>
  );
}

export function Stepper({
  value,
  onDec,
  onInc,
  min = 1,
  max = 99,
  size = 'md',
}: {
  value: number;
  onDec: () => void;
  onInc: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}) {
  const btn =
    size === 'sm'
      ? 'w-9 h-9'
      : 'w-11 h-11';
  const val = size === 'sm' ? 'text-[15px] min-w-[24px]' : 'text-[17px] min-w-[30px]';
  return (
    <div className="inline-flex items-center bg-card rounded-full shadow-[inset_0_0_0_1.5px_var(--line)]">
      <button
        type="button"
        onClick={onDec}
        disabled={value <= min}
        aria-label="Зменшити кількість"
        className={`${btn} flex items-center justify-center rounded-full text-green hover:bg-green-tint disabled:text-ink-faint disabled:cursor-not-allowed transition-colors`}
      >
        <MinusIcon />
      </button>
      <span className={`font-display font-semibold text-center text-ink ${val}`}>{value}</span>
      <button
        type="button"
        onClick={onInc}
        disabled={value >= max}
        aria-label="Збільшити кількість"
        className={`${btn} flex items-center justify-center rounded-full text-green hover:bg-green-tint disabled:text-ink-faint disabled:cursor-not-allowed transition-colors`}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
