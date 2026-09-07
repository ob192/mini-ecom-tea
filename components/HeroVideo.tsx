'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/*
  HeroVideo — the home hero's motion layer.

  It sits *above* the hero photograph and below the scrims, and fades in only
  once it is actually playing. Until then (and forever, for anyone excluded
  below) the photograph shows through, so the hero is never blank and the LCP
  element stays an image that next/image has already optimised.

  ## Why the sources are attached in an effect

  The element ships with `preload="none"` and no <source> children at all, so
  the markup alone downloads nothing. The effect decides whether this visitor
  should spend the bytes and only then attaches sources and calls load(). A
  <source media> in static markup would have been simpler, but it gives up that
  decision: autoplay makes the browser fetch regardless, and there is no markup
  for "not on a metered connection".

  Excluded, in order:
    - `prefers-reduced-motion: reduce` — a looping background is exactly what
      that setting is about.
    - `connection.saveData` — the visitor has asked for less data.
    - a 2g effectiveType — the video would arrive long after it mattered.
  Each of these leaves the poster photograph in place, which is a complete
  hero, not a degraded one.

  ## The renditions

  Built from media/main_video.mp4 (3840x2160, 12.5 Mbps, 23 MB, no audio — it
  is decorative, so audio was never encoded and `muted` is not a compromise).
  Serving that master would have been ~27x the weight of the entire rest of the
  page. Regenerate with:

    ffmpeg -i media/main_video.mp4 -an -vf "scale=1280:720:flags=lanczos" \
      -c:v libx264 -preset slow -crf 27 -profile:v main -pix_fmt yuv420p \
      -g 50 -movflags +faststart public/video/hero-720.mp4
    ffmpeg -i media/main_video.mp4 -an -vf "scale=1920:1080:flags=lanczos" \
      -c:v libx264 -preset slow -crf 26 -profile:v high -pix_fmt yuv420p \
      -g 50 -movflags +faststart public/video/hero-1080.mp4
    ffmpeg -i media/main_video.mp4 -an -vf "scale=1280:720:flags=lanczos" \
      -c:v libvpx-vp9 -crf 36 -b:v 0 -cpu-used 2 -row-mt 1 -g 50 \
      public/video/hero-720.webm
    ffmpeg -i media/main_video.mp4 -an -vf "scale=1920:1080:flags=lanczos" \
      -c:v libvpx-vp9 -crf 34 -b:v 0 -cpu-used 2 -row-mt 1 -g 50 \
      public/video/hero-1080.webm

  `-movflags +faststart` matters: without it the MP4's index sits at the end of
  the file and playback waits for the whole download. AV1 was measured and
  dropped — 759 KB against VP9's 851 KB at 720p, which does not pay for a third
  codec and software decode on the cheap Androids that make up most of the
  mobile traffic.
*/

/** Phones get 720p. The shell caps at 1440px, so 1080p covers every desktop. */
const BREAKPOINT = '(min-width: 768px)';

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

function shouldPlay(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && /(^|-)2g$/.test(connection.effectiveType)) return false;

  return true;
}

export function HeroVideo({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || !shouldPlay()) return;

    // Strict mode runs effects twice in development; without this the second
    // pass appends a duplicate pair of sources.
    if (!video.querySelector('source')) {
      const base = window.matchMedia(BREAKPOINT).matches
        ? '/video/hero-1080'
        : '/video/hero-720';

      // WebM first: VP9 is ~30% smaller than the H.264 twin, and a browser
      // that cannot decode it falls through to the MP4 on the next line.
      for (const [extension, type] of [
        ['webm', 'video/webm'],
        ['mp4', 'video/mp4'],
      ]) {
        const source = document.createElement('source');
        source.src = `${base}.${extension}`;
        source.type = type;
        video.appendChild(source);
      }

      video.load();
    }

    /*
      Three ways to learn that playback started, because no single one is
      reliable. The `playing` event can fire before React attaches the listener
      when the file is already in cache — observed exactly that: a video with
      readyState 4 running at 6s, still sitting at opacity 0. The play()
      promise resolves when playback actually begins, and the direct check
      catches the case where it began before either was wired up.
    */
    const markPlaying = () => setPlaying(true);
    video.addEventListener('playing', markPlaying);
    // Autoplay can still be refused (iOS Low Power Mode, a user setting). That
    // is not an error worth surfacing — the poster is already the fallback.
    void video.play().then(markPlaying).catch(() => {});
    if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) markPlaying();

    return () => video.removeEventListener('playing', markPlaying);
  }, []);

  return (
    <video
      ref={ref}
      aria-hidden
      tabIndex={-1}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none',
        playing ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  );
}
