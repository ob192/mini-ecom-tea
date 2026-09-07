import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import nextConfig from '@/next.config.mjs';

/*
  Two production incidents are pinned here.

  1. The cookie notice ate the buy button. Both the notice
     (components/CookieConsent.tsx) and the buy / submit bars
     (app/styles/sticky-bar.css) anchor themselves to the bottom of the
     viewport. The notice is z-50 and the bars z-40, so on a 375x812 phone the
     notice covered 89% of «Додати в кошик» — `elementFromPoint` at the centre
     of the button returned «Добре». Every first-time mobile visitor hit that,
     and every ad click is a first-time visitor: 86 mobile users over the 90
     days to 2026-09-07 produced one add_to_cart and zero checkouts.

     The fix is a handshake, not a z-index swap: the notice publishes its
     height as `--cookie-notice-h`, the bars add it to their `bottom`. Nothing
     else links the two files, so either half can be removed without the other
     looking wrong — which is what these tests catch.

  2. `/?cat=<slug>` stopped filtering. It used to be the catalogue URL; the
     redesign moved the grid to /catalog and the home page ignores the
     parameter. It is still the Google Ads final URL, so it must redirect
     rather than silently land on an unfiltered home page.
*/

const HEIGHT_VAR = '--cookie-notice-h';

const notice = readFileSync(join(process.cwd(), 'components/CookieConsent.tsx'), 'utf8');
const stickyBar = readFileSync(join(process.cwd(), 'app/styles/sticky-bar.css'), 'utf8');

describe('bottom-anchored layers', () => {
  it('the cookie notice publishes its height', () => {
    expect(notice).toContain(`const HEIGHT_VAR = '${HEIGHT_VAR}'`);
    expect(notice).toMatch(/setProperty\(HEIGHT_VAR/);
    expect(notice).toMatch(/removeProperty\(HEIGHT_VAR\)/);
  });

  it('the height is only written when it actually changes', () => {
    // The published height feeds `body { padding-bottom }`, which can add a
    // scrollbar, which narrows the viewport, which rewraps the notice — so an
    // observer that writes unconditionally can drive that in a circle. The
    // guard makes it settle in one pass, and every watcher must go through it.
    expect(notice).toMatch(/if \(height === last\) return;/);
    expect(notice).toMatch(/addEventListener\('resize', publish\)/);
  });

  it('the notice is still the layer anchored to the bottom of the viewport', () => {
    // If it stops being fixed to the bottom it no longer collides with the
    // bars, and the handshake above is dead weight rather than a live fix.
    expect(notice).toMatch(/fixed inset-x-0 bottom-0 z-50/);
  });

  it('the sticky bar offsets itself by the notice height', () => {
    const bottom = stickyBar.match(/\n\s*bottom:\s*([^;]+);/)?.[1];
    expect(bottom, 'sticky-bar has no `bottom`').toBeDefined();
    expect(bottom).toContain(`var(${HEIGHT_VAR}`);
    // A fallback is mandatory: with no notice on screen the variable is not
    // set at all, and `calc(12px + var(--x))` with no fallback is invalid —
    // the bar would fall back to `bottom: auto` and stop sticking entirely.
    expect(bottom).toMatch(new RegExp(`var\\(${HEIGHT_VAR},\\s*0(px)?\\)`));
  });

  it('the notice still outranks the bar, so it can always be dismissed', () => {
    const barZ = Number(stickyBar.match(/z-index:\s*(\d+)/)?.[1]);
    expect(barZ).toBeLessThan(50);
  });
});

describe('legacy catalogue links', () => {
  it('/?cat=<slug> redirects to the catalogue, preserving the filter', () => {
    return nextConfig.redirects!().then((rules) => {
      const rule = rules.find(
        (r) => r.source === '/' && r.has?.some((h) => h.type === 'query' && h.key === 'cat'),
      );
      expect(rule, '`/?cat=` no longer redirects — ad clicks land unfiltered').toBeDefined();
      expect(rule!.destination).toBe('/catalog?cat=:cat');
      expect(rule!.permanent).toBe(true);
    });
  });
});
