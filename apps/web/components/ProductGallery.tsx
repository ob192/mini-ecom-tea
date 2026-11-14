'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ZoomIn, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { tone } from '@/lib/products';
import type { ProductVideo } from '@/lib/types';
import { Leaf } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function ProductGallery({
  images,
  category,
  alt,
  video = null,
  ratio = '4 / 5',
  radius = 22,
  sizes = '(max-width: 480px) 100vw, (max-width: 1024px) 720px, 520px',
}: {
  images: string[];
  category: string;
  alt: string;
  /** Optional clip, shown as the last slide. See the comment above the stage. */
  video?: ProductVideo | null;
  ratio?: string;
  radius?: number;
  sizes?: string;
}) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  /* The <video> element does not exist until this is true. See below. */
  const [playing, setPlaying] = useState(false);

  /* The video is the LAST slide on purpose: the first slide stays a
     photograph, so the LCP element, the OG image and the JSON-LD image are
     what they were. */
  const videoIndex = images.length;
  const videoActive = video != null && active === videoIndex;

  // Leaving the slide tears the player down, so going back shows the poster
  // again rather than a paused frame with sound that already ran.
  useEffect(() => {
    if (!videoActive && playing) setPlaying(false);
  }, [videoActive, playing]);

  if (images.length === 0 && video == null) {
    return <PlaceholderImage category={category} alt={alt} ratio={ratio} radius={radius} />;
  }

  /* Dialog-only: the lightbox pages through photographs, never the video. */
  const go = (delta: number) =>
    setActive((i) => (i + delta + images.length) % images.length);

  return (
    <div>
      {videoActive && video ? (
        /*
          The clip follows components/HeroVideo.tsx's rule — no video URL in the
          server-rendered HTML — but by a simpler route: the <video> element is
          not rendered at all until `playing`, so nothing to fetch exists until
          the visitor presses play. A `preload="none"` <video> would still ship
          the URL in the markup and still let a browser open a connection.

          Unlike the hero, this is NOT a muted autoplay loop: the footage has
          sound. It plays on an explicit press, with real controls, and the
          visitor can mute or scrub. Autoplaying audio on a product page is its
          own conversion bug.

          `object-cover`, like every other slide. The clip is 720x1280 vertical
          and the stage is square, so `contain` letterboxed it into roughly half
          dark bars on the page's primary image area; cover keeps the middle
          square, which is where the open box and the pouches are. The backdrop
          stays dark for the moment between the poster and the first frame.
        */
        <div
          className="relative w-full overflow-hidden bg-inverse"
          style={{ aspectRatio: ratio, borderRadius: radius }}
        >
          {playing ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={video.src}
              poster={video.poster}
              controls
              autoPlay
              playsInline
              preload="none"
              aria-label={video.label}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <>
              <Image
                src={video.poster}
                alt=""
                fill
                sizes={sizes}
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`Відтворити відео: ${video.label}`}
                className="absolute inset-0 grid place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <span className="grid size-16 place-items-center rounded-full bg-inverse/55 text-inverse-foreground backdrop-blur-sm transition hover:bg-inverse/70 active:bg-inverse/80">
                  <Play className="size-7 translate-x-0.5" strokeWidth={1.7} fill="currentColor" />
                </span>
              </button>
              <span className="pointer-events-none absolute bottom-3 left-3 right-3 truncate rounded-full bg-inverse/60 px-3 py-1 text-xs text-inverse-foreground backdrop-blur-sm">
                {video.label}
              </span>
            </>
          )}
        </div>
      ) : (
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        aria-label="Збільшити фото"
        className="group relative block w-full overflow-hidden cursor-zoom-in"
        style={{ aspectRatio: ratio, borderRadius: radius }}
      >
        {/* All photos are mounted (and eagerly fetched) up front so switching
            the active one is an instant opacity swap, not a new network request. */}
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === active ? alt : ''}
            aria-hidden={i !== active}
            fill
            sizes={sizes}
            priority
            className={`object-cover transition-opacity duration-150 ${
 i === active ?'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        ))}
        {/*
          Visible by default on a touch screen. Tailwind 4 only applies `hover:`
          under `(hover: hover)`, so on a phone this hint never appeared at all
          and nothing said the photograph could be opened. The photograph itself
          is the button, so this was only ever an affordance — but an affordance
          nobody sees is not one (design-mobile §6).
        */}
        {/*
          `text-inverse-foreground`, never `text-primary-foreground`. These
          chips sit on `bg-inverse/NN` over a photograph, and
          `--primary-foreground` is **ink** (neutral-900) in this brand
          direction — it was drawing dark glyphs on a dark scrim, which is the
          trap CLAUDE.md names. `--inverse-foreground` is the token paired with
          `inverse`: near-white, 16.9:1 on it.

          The scrim strengths are measured, not picked: composited over the
          brightest pixel of a real poster, /45 gave 2.84:1, which fails both
          the 4.5:1 text bar and the 3:1 non-text one. Text pills are /60
          (4.5:1 against any pixel in the image) and icon chips /55 (3.8:1).
        */}
        <span className="absolute bottom-3 right-3 flex items-center justify-center size-9 rounded-full bg-inverse/55 text-inverse-foreground backdrop-blur-sm transition opacity-100 pointer-fine:opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ZoomIn className="size-5" strokeWidth={1.7} />
        </span>
      </button>
      )}

      {images.length + (video ? 1 : 0) > 1 ? (
        <div className="flex gap-2 mt-2.5 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              aria-label={`Фото ${i + 1}`}
              className={`relative shrink-0 size-16 rounded-xl overflow-hidden transition ${
 i === active
 ?'ring-2 ring-ring ring-offset-0'
                  : 'border border-border opacity-75 hover:opacity-100 active:opacity-100'
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}

          {/* The clip's own thumbnail, marked with a play badge so the strip
              says there is a video without anyone having to press it. */}
          {video ? (
            <button
              type="button"
              onClick={() => setActive(videoIndex)}
              aria-pressed={videoActive}
              aria-label={`Відео: ${video.label}`}
              className={`relative shrink-0 size-16 overflow-hidden rounded-xl bg-inverse transition ${
                videoActive
                  ? 'ring-2 ring-ring ring-offset-0'
                  : 'border border-border opacity-75 hover:opacity-100 active:opacity-100'
              }`}
            >
              <Image src={video.poster} alt="" fill sizes="64px" className="object-cover" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid size-7 place-items-center rounded-full bg-inverse/60 text-inverse-foreground backdrop-blur-sm">
                  <Play className="size-3.5 translate-x-px" strokeWidth={2} fill="currentColor" />
                </span>
              </span>
            </button>
          ) : null}
        </div>
      ) : null}

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent
          className={
            'left-0 top-0 h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-none bg-inverse p-0 shadow-none ' +
            'sm:left-1/2 sm:top-1/2 sm:h-auto sm:w-[calc(100%-1.5rem)] sm:max-w-4xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:bg-card/95 sm:p-1.5 sm:shadow-xl'
          }
        >
          <div className="relative size-full overflow-hidden sm:aspect-square sm:h-auto sm:rounded-xl">
            <ZoomableImage
              images={images}
              active={active}
              alt={alt}
              onSwipeNext={images.length > 1 ? () => go(1) : undefined}
              onSwipePrev={images.length > 1 ? () => go(-1) : undefined}
              onSwipeDismiss={() => setZoomOpen(false)}
            />

            {/* scrim so the close button stays legible over bright photos on mobile */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-inverse/55 to-transparent sm:hidden" />

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Попереднє фото"
                  className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-inverse/55 text-inverse-foreground backdrop-blur-sm transition hover:bg-inverse/70 active:bg-inverse/80"
                >
                  <ChevronLeft className="size-5" strokeWidth={1.7} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Наступне фото"
                  className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-inverse/55 text-inverse-foreground backdrop-blur-sm transition hover:bg-inverse/70 active:bg-inverse/80"
                >
                  <ChevronRight className="size-5" strokeWidth={1.7} />
                </button>
                <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-inverse/60 px-3 py-1 text-xs tracking-wide text-inverse-foreground backdrop-blur-sm">
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
  images,
  active,
  alt,
  onSwipeNext,
  onSwipePrev,
  onSwipeDismiss,
}: {
  images: string[];
  active: number;
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
  }, [active]);

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
      className="size-full touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* All photos are mounted up front (eagerly fetched) so paging through
          the lightbox is an instant opacity swap, not a new network request. */}
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === active ? alt : ''}
          aria-hidden={i !== active}
          fill
          sizes="100vw"
          priority
          draggable={false}
          className={`object-contain transition-opacity duration-150 ${
 i === active ?'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={i === active ? { transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` } : undefined}
        />
      ))}
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
        <Leaf width="42%" height="42%" />
      </div>
    </div>
  );
}
