import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
  «Читати далі» on a product page is an in-page jump to #opys, a screen and a
  half down. Two things make that jump work, and both live in CSS:

    - `scroll-behavior: smooth`, so the reader sees the travel and understands
      they moved within the page rather than navigating away from it.
    - `scroll-margin-top`, because the header is sticky. Without it the browser
      parks #opys under the bar and the «ОПИС» heading it was aiming at is the
      part that ends up hidden.

  The offset is a number that has to stay larger than the header, and nothing
  connects the two but this test.
*/
const base = readFileSync(join(process.cwd(), 'app/styles/base.css'), 'utf8');
const header = readFileSync(join(process.cwd(), 'components/Header.tsx'), 'utf8');

const anchorOffset = Number(base.match(/scroll-margin-top:\s*(\d+)px/)?.[1]);

describe('in-page anchors', () => {
  it('scroll smoothly', () => {
    expect(base).toMatch(/scroll-behavior:\s*smooth/);
  });

  it('but not for a reader who asked for less motion', () => {
    const reduced = base.match(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\{[^}]*\}/g,
    );
    expect(reduced?.some((block) => /scroll-behavior:\s*auto/.test(block))).toBe(true);
  });

  it('clear the sticky header instead of landing underneath it', () => {
    expect(anchorOffset, 'no scroll-margin-top in base.css').toBeGreaterThan(0);

    /*
      The header is a 60px bar plus, on pages that carry one, a «Назад» row —
      104px measured, identical on mobile and desktop. Read the bar height back
      out of the component so raising it fails here rather than silently
      tucking every anchor target behind the header.
    */
    const barHeight = Number(header.match(/h-\[(\d+)px\]/)?.[1]);
    expect(barHeight, 'header bar height not found in Header.tsx').toBeGreaterThan(0);
    expect(anchorOffset).toBeGreaterThanOrEqual(barHeight);
  });

  it('get the offset unconditionally, not only once targeted', () => {
    // `:target` matches only after the fragment already points at the element,
    // which races the scroll Next's router performs.
    expect(base).toMatch(/\[id\]\s*\{\s*\n?\s*scroll-margin-top/);
  });
});
