import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { products, getProduct } from '@/lib/products';

/*
  A product video is its own field, and it stays out of everything that expects
  a photograph.

  `files` is the photo list: it becomes `images` (the gallery), `image` (the
  first photo), the OG and JSON-LD image, and `g:image_link` in the Merchant
  Center feed. A .mp4 in that array would be handed to `next/image`, could
  become the feed's image link, and would be rejected by Google — a silent way
  to drop a product out of Shopping. These tests hold that line, and hold the
  loading discipline the hero established: nothing is fetched until the visitor
  asks for it.
*/
const code = (p: string) =>
  readFileSync(join(process.cwd(), p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

const gallery = code('components/ProductGallery.tsx');
const feed = code('lib/merchant-feed.ts');
const jsonld = code('components/JsonLd.tsx');

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;

describe('the video field', () => {
  it('the starter set has one, resolved to public paths', () => {
    const set = getProduct('set/start-mini-7');
    expect(set?.video).toBeTruthy();
    expect(set!.video!.src).toBe('/set/start-mini-7/unboxing-720.mp4');
    expect(set!.video!.poster).toBe('/set/start-mini-7/unboxing-poster.jpg');
    expect(set!.video!.label.length).toBeGreaterThan(0);
  });

  it('both files exist and the clip stays in the hero weight class', () => {
    const set = getProduct('set/start-mini-7')!;
    for (const p of [set.video!.src, set.video!.poster]) {
      expect(existsSync(join(process.cwd(), 'public', p))).toBe(true);
    }
    const mb = statSync(join(process.cwd(), 'public', set.video!.src)).size / 1024 / 1024;
    expect(mb).toBeLessThan(2.5);
  });

  it('every other product has null, not undefined', () => {
    for (const p of products) {
      if (p.slug === 'set/start-mini-7') continue;
      expect(p.video).toBeNull();
    }
  });

  it('no video ever reaches the photo paths', () => {
    for (const p of products) {
      for (const f of p.files) expect(f).not.toMatch(VIDEO_EXT);
      for (const i of p.images) expect(i).not.toMatch(VIDEO_EXT);
      expect(p.image).not.toMatch(VIDEO_EXT);
    }
  });

  it('the feed and the JSON-LD never read it', () => {
    // Both build their image fields from `images` / `image`; if either ever
    // starts reading `.video`, Google is being handed a video as a photo.
    expect(feed).not.toMatch(/\.video\b/);
    expect(jsonld).not.toMatch(/\.video\b/);
  });
});

describe('the gallery only fetches the clip on a press', () => {
  it('the <video> element does not exist until playing', () => {
    // Not `preload="none"` on a mounted element — that still ships the URL in
    // the markup and still lets a browser open a connection.
    expect(gallery).toMatch(/\{playing \? \([\s\S]{0,400}<video/);
    expect(gallery).toMatch(/const \[playing, setPlaying\] = useState\(false\)/);
  });

  it('leaving the slide tears the player down', () => {
    expect(gallery).toMatch(/if \(!videoActive && playing\) setPlaying\(false\)/);
  });

  it('it is not a muted autoplay loop — the footage has sound', () => {
    // The hero is muted and loops because it plays unasked. This one plays
    // because someone pressed it, so it keeps its audio and real controls.
    expect(gallery).toMatch(/controls/);
    expect(gallery).not.toMatch(/<video[\s\S]{0,300}muted/);
    expect(gallery).not.toMatch(/<video[\s\S]{0,300}loop/);
    expect(gallery).toMatch(/playsInline/);
  });

  it('the clip is the last slide, so the first is still a photograph', () => {
    // The LCP element, the OG image and the JSON-LD image all come off the
    // first photo; a video slide in front of it would change all three.
    expect(gallery).toMatch(/const videoIndex = images\.length/);
  });

  it('the play control and the slide both have names', () => {
    expect(gallery).toMatch(/aria-label=\{`Відтворити відео: \$\{video\.label\}`\}/);
    expect(gallery).toMatch(/aria-label=\{`Відео: \$\{video\.label\}`\}/);
  });

  it('the lightbox still pages through photographs only', () => {
    expect(gallery).toMatch(/setActive\(\(i\) => \(i \+ delta \+ images\.length\) % images\.length\)/);
  });
});
