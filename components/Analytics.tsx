'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { trackContactClick, trackPageView } from '@/lib/analytics';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * GTM container loader.
 *
 * Google's copy-paste snippet says "as high in the <head> as possible"; in the
 * App Router the equivalent is next/script with `afterInteractive` (what
 * @next/third-parties' own GoogleTagManager uses). The loader is async either
 * way, so the only difference is that it no longer competes with hydration.
 */
export function GoogleTagManager() {
  if (!GTM_ID) return null;
  return (
    <Script
      id="gtm-loader"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
      }}
    />
  );
}

/** The <noscript> half of the snippet — must sit immediately after <body>. */
export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}

/**
 * Phone / messenger link that reports a `contact_click`. Ordering happens by
 * phone and Telegram as often as through the cart, and GA4's enhanced
 * measurement doesn't see `tel:` links at all — so these are our own events.
 */
export function ContactLink({
  channel,
  location,
  href,
  className,
  children,
}: {
  channel: 'phone' | 'telegram' | 'instagram' | 'email';
  /** Where on the site the link sits, e.g. "footer" / "contacts_page". */
  location: string;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      className={className}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onClick={() => trackContactClick(channel, location)}
    >
      {children}
    </a>
  );
}

/**
 * Client-side route changes don't reload the document, so the Google tag only
 * ever sees the first page. We push our own `page_view` on every subsequent
 * navigation (the initial one is already sent by the Google tag on load).
 *
 * This requires GA4 Enhanced Measurement → "Page changes based on browser
 * history events" to be OFF, otherwise SPA views are counted twice.
 * Uses useSearchParams, so it must be rendered inside <Suspense>.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!GTM_ID) return;
    const qs = searchParams.toString();
    const url = window.location.origin + pathname + (qs ? `?${qs}` : '');

    // First run = the document load the Google tag already tracked.
    if (lastUrl.current === null) {
      lastUrl.current = url;
      return;
    }
    if (lastUrl.current === url) return;
    lastUrl.current = url;

    // Let Next apply the new route's <title> before we read it.
    const t = setTimeout(() => trackPageView(url, document.title), 50);
    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  return null;
}
