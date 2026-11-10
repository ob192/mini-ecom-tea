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
const base = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');
const header = readFileSync(join(process.cwd(), 'components/Header.tsx'), 'utf8');

// `scroll-padding-top` is written in rem; 1rem = 16px.
const anchorOffset = Number(base.match(/scroll-padding-top:\s*([\d.]+)rem/)?.[1]) * 16;

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
    expect(anchorOffset, 'no scroll-padding-top in globals.css').toBeGreaterThan(0);

    /*
      The header is a 56px bar plus, on pages that carry one, a 44px «Назад»
      row. Read the bar height back out of the component so raising it fails
      here rather than silently tucking every anchor target behind the header.
    */
    const barHeight = Number(header.match(/\bh-(\d+)\b/)?.[1]) * 4;
    expect(barHeight, 'header bar height not found in Header.tsx').toBeGreaterThan(0);
    expect(anchorOffset).toBeGreaterThanOrEqual(barHeight);
  });

  it('offsets every anchor, and keeps focus clear of the bar too', () => {
    /*
      `scroll-padding-top` on the scroll container, not `scroll-margin-top` on
      `[id]`. Two reasons it is the stronger of the two: `:target` and
      `scroll-margin` only act on the element being scrolled to, so a control
      the keyboard moves focus to still lands under the bar (WCAG 2.4.11); and
      it needs no per-element rule to be complete.
    */
    expect(base).toMatch(/html\s*\{[\s\S]*?scroll-padding-top/);
  });
});
