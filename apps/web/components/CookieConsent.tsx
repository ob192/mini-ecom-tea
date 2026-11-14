'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Cookie notice.
 *
 * This is a *notice*, not a gate: the GTM container in `components/Analytics.tsx`
 * still loads for everyone. Ukraine has no prior-consent requirement for
 * analytics cookies the way the EU does — the obligation is to inform — and
 * blocking GA4 until a click would also strip the `_ga` cookies that
 * `lib/ga4-server.ts` needs to attribute the server-side `purchase` event.
 * Upgrading to real gating means Google Consent Mode v2, which is a deliberate
 * analytics change rather than a copy change; see docs/analytics.md.
 */

const LS_KEY = 'teache_cookie_notice_v1';

/**
 * The height the notice currently occupies, published to the document root so
 * the bottom-anchored bars below it can get out of the way.
 *
 * This exists because of a real, measured incident. The notice is `z-50`; the
 * product page's buy bar and the checkout's submit bar are `.sticky-bar`,
 * `z-40`, `bottom: 12px`. On a 375x812 phone the two occupied the same strip
 * and the notice won: 89% of «Додати в кошик» was not hit-testable, and
 * `elementFromPoint` at the centre of the button returned «Добре». Every
 * first-time mobile visitor — which is every ad click — therefore tapped
 * Add-to-cart and got the notice dismissed instead of a cart line. Over the
 * 90 days to 2026-09-07 GA4 recorded 86 mobile users, 18 product views, one
 * add_to_cart and zero begin_checkout, against a desktop funnel that
 * completed orders normally.
 *
 * The stacking order is not the bug — a notice belongs above the page. The bug
 * was that nothing told the bars how tall it is. So the notice measures itself
 * while visible; `app/styles/sticky-bar.css` adds this to its `bottom`, and
 * both layers stay visible and tappable. Removed on dismiss, so the bars drop
 * back. Keep the two in step: `tests/bottom-layers.test.ts` pins the pair.
 */
const HEIGHT_VAR = '--cookie-notice-h';

export function CookieConsent() {
  // Never render on the server: the stored decision only exists in the browser,
  // and prerendering "visible" would flash the banner at people who dismissed it.
  const [visible, setVisible] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem(LS_KEY)) setVisible(true);
    } catch {
      // Private mode / storage disabled — show it, just don't persist.
      setVisible(true);
    }
  }, []);

  /*
    Publish the notice's height for as long as it is on screen. Measured rather
    than hardcoded: the copy wraps to two lines on narrow phones and collapses
    to a single row from `sm`, so the strip is not one fixed number.

    Two sources, because they fail differently. A ResizeObserver sees the notice
    rewrap for any reason, including ones no event announces; `resize` /
    `orientationchange` still fire if the observer is never delivered.

    The `last` guard is not just a micro-optimisation. The published height
    feeds `body { padding-bottom }` (app/styles/base.css), which on a short page
    can bring in a vertical scrollbar, which narrows the viewport, which rewraps
    this copy — an observer that writes unconditionally can drive that in a
    circle. Writing only on a real change makes it settle in one pass.
  */
  useEffect(() => {
    const root = document.documentElement;

    if (!visible) {
      root.style.removeProperty(HEIGHT_VAR);
      return;
    }

    let last = -1;

    const publish = () => {
      const box = boxRef.current;
      if (!box) return;
      const height = Math.ceil(box.getBoundingClientRect().height);
      if (height === last) return;
      last = height;
      root.style.setProperty(HEIGHT_VAR, `${height}px`);
    };

    publish();
    // The display face is loaded by next/font; the button label reflows when it
    // arrives, which on a cold cache lands after this first measurement.
    document.fonts?.ready.then(publish).catch(() => {});

    window.addEventListener('resize', publish);
    window.addEventListener('orientationchange', publish);

    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(publish);
    observer?.observe(boxRef.current!);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', publish);
      window.removeEventListener('orientationchange', publish);
      root.style.removeProperty(HEIGHT_VAR);
    };
  }, [visible]);

  function accept() {
    try {
      localStorage.setItem(LS_KEY, String(Date.now()));
    } catch {
      // Nothing to do: the notice reappears next visit, which is acceptable.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      ref={boxRef}
      role="dialog"
      aria-live="polite"
      aria-label="Повідомлення про файли cookie"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(18px+env(safe-area-inset-bottom,0px))] pt-2 pointer-events-none"
    >
      {/*
        A notice is not an advert: it sits on the popover surface, not on a panel
        of brand colour, and the brand is on its one button (C5, C7).

        The copy is two lines on a phone, not four. Measured: the notice was
        175px tall, and with the sticky header it put 46% of a 375×812 screen
        under pinned panels on a first visit — which is every ad click. It is now
        a row even on a phone, so it costs about 90px, and the sentence says the
        same thing in fewer words.
      */}
      <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center gap-3 rounded-xl bg-popover p-3 text-popover-foreground shadow-xl sm:gap-4 sm:p-4">
        <p className="min-w-0 flex-1 text-sm text-muted-foreground text-pretty">
          Ми використовуємо cookie, щоб сайт працював і щоб розуміти, які чаї вам цікаві.{' '}
          <Link
            href="/privacy"
            className="text-foreground underline underline-offset-4 hover:text-primary-subtle-foreground"
          >
            Деталі
          </Link>
          .
        </p>
        <Button onClick={accept} size="sm" className="shrink-0">
          Добре
        </Button>
      </div>
    </div>
  );
}
