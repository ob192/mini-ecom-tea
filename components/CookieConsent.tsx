'use client';

import { useEffect, useState } from 'react';
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

export function CookieConsent() {
  // Never render on the server: the stored decision only exists in the browser,
  // and prerendering "visible" would flash the banner at people who dismissed it.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(LS_KEY)) setVisible(true);
    } catch {
      // Private mode / storage disabled — show it, just don't persist.
      setVisible(true);
    }
  }, []);

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
      role="dialog"
      aria-live="polite"
      aria-label="Повідомлення про файли cookie"
      className="animate-screenIn fixed inset-x-0 bottom-0 z-50 px-[18px] pb-[18px] pt-2 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-[560px] rounded-xl bg-green text-on-green shadow-sh-2 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <p className="m-0 flex-1 text-[13.5px] leading-relaxed text-on-green/85">
          Ми використовуємо файли cookie, щоб сайт працював коректно та щоб розуміти, які чаї вам
          цікаві. Деталі —{' '}
          <Link
            href="/privacy"
            className="text-amber underline underline-offset-2 hover:text-on-green"
          >
            в Угоді користувача
          </Link>
          .
        </p>
        <Button
          onClick={accept}
          variant="pill"
          size="lg"
          className="shrink-0 bg-amber text-ink hover:bg-amber/90 sm:w-auto"
        >
          Добре
        </Button>
      </div>
    </div>
  );
}
