'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { tone } from '@/lib/products';
import { LeafIcon } from '@/components/Icons';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function ProductGallery({
  images,
  category,
  alt,
  ratio = '4 / 5',
  radius = 22,
  priority = false,
  sizes = '(max-width: 480px) 100vw, (max-width: 1024px) 720px, 520px',
}: {
  images: string[];
  category: string;
  alt: string;
  ratio?: string;
  radius?: number;
  priority?: boolean;
  sizes?: string;
}) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  if (images.length === 0) {
    return <PlaceholderImage category={category} alt={alt} ratio={ratio} radius={radius} />;
  }

  const go = (delta: number) =>
    setActive((i) => (i + delta + images.length) % images.length);

  return (
    <div>
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        aria-label="Збільшити фото"
        className="group relative block w-full overflow-hidden cursor-zoom-in"
        style={{ aspectRatio: ratio, borderRadius: radius }}
      >
        <Image
          src={images[active]}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
        <span className="absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full bg-ink/45 text-on-green backdrop-blur-sm opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <ZoomIn width={18} height={18} strokeWidth={1.7} />
        </span>
      </button>

      {images.length > 1 ? (
        <div className="flex gap-2 mt-2.5 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              aria-label={`Фото ${i + 1}`}
              className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden transition ${
                i === active
                  ? 'ring-2 ring-green ring-offset-0'
                  : 'opacity-75 shadow-[inset_0_0_0_1.5px_var(--line)] hover:opacity-100'
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent
          className={
            'left-0 top-0 h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-none bg-ink p-0 shadow-none ' +
            'sm:left-1/2 sm:top-1/2 sm:h-auto sm:w-[calc(100%-1.5rem)] sm:max-w-[880px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:bg-card/95 sm:p-1.5 sm:shadow-sh-2'
          }
        >
          <div className="relative h-full w-full overflow-hidden sm:aspect-square sm:h-auto sm:rounded-2xl">
            <ZoomableImage
              src={images[active]}
              alt={alt}
              onSwipeNext={images.length > 1 ? () => go(1) : undefined}
              onSwipePrev={images.length > 1 ? () => go(-1) : undefined}
              onSwipeDismiss={() => setZoomOpen(false)}
            />

            {/* scrim so the close button stays legible over bright photos on mobile */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-ink/55 to-transparent sm:hidden" />

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Попереднє фото"
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-ink/45 text-on-green backdrop-blur-sm hover:bg-ink/60 transition"
                >
                  <ChevronLeft width={20} height={20} strokeWidth={1.7} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Наступне фото"
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-ink/45 text-on-green backdrop-blur-sm hover:bg-ink/60 transition"
                >
                  <ChevronRight width={20} height={20} strokeWidth={1.7} />
                </button>
                <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/45 px-3 py-1 font-display text-[12px] tracking-wide text-on-green backdrop-blur-sm">
                  {active + 1} / {images.length}
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Full-bleed image viewer used inside the zoom dialog.
 * Touch-first: double-tap (or double-click) toggles zoom around the tap
 * point, dragging pans while zoomed, and — while at 1x — a horizontal swipe
 * moves to the next/prev photo and a vertical swipe dismisses the dialog.
 */
function ZoomableImage({
  src,
  alt,
  onSwipeNext,
  onSwipePrev,
  onSwipeDismiss,
}: {
  src: string;
  alt: string;
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
  onSwipeDismiss?: () => void;
}) {
  const ZOOM = 2.4;
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number; moved: boolean } | null>(
    null,
  );
  const lastTapRef = useRef(0);

  // Reset zoom/pan whenever the active photo changes.
  useEffect(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [src]);

  const toggleZoom = (clientX: number, clientY: number, rect: DOMRect) => {
    if (scale > 1) {
      setScale(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    const relX = (clientX - rect.left) / rect.width - 0.5;
    const relY = (clientY - rect.top) / rect.height - 0.5;
    setScale(ZOOM);
    setPan({ x: -relX * rect.width * (ZOOM - 1) * 0.5, y: -relY * rect.height * (ZOOM - 1) * 0.5 });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y, moved: false };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.moved = true;
    if (scale > 1) setPan({ x: drag.panX + dx, y: drag.panY + dy });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.moved) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        toggleZoom(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
      return;
    }

    if (scale === 1) {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (absDy > 70 && absDy > absDx) {
        onSwipeDismiss?.();
      } else if (absDx > 60 && absDx > absDy) {
        if (dx < 0) onSwipeNext?.();
        else onSwipePrev?.();
      }
    }
  };

  return (
    <div
      className="h-full w-full touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        draggable={false}
        className="object-contain transition-transform duration-150 ease-out"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
      />
    </div>
  );
}

function PlaceholderImage({
  category,
  alt,
  ratio,
  radius,
}: {
  category: string;
  alt: string;
  ratio: string;
  radius: number;
}) {
  const t = tone(category);
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
    </div>
  );
}
