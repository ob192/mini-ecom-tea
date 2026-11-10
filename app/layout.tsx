import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import localFont from 'next/font/local';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/JsonLd';
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
  PageViewTracker,
} from '@/components/Analytics';
import { Toaster } from '@/components/ui/sonner';
import { CookieConsent } from '@/components/CookieConsent';
import { siteUrl } from '@/lib/format';
import { BRAND_NAME } from '@/lib/contacts';

/*
  One family for everything: headings, body, prices, the wordmark. The old
  system split Oswald (display) from PT Sans (body); Geist carries both jobs at
  moderate sizes, and one family is one request fewer on a phone.

  Self-hosted from the file rather than `next/font/google`, because of ₴.
  Google splits Geist into subset files and gives each a `unicode-range`:
  `cyrillic` covers U+0400–045F, U+0490–0491 and № (U+2116); `latin` stops at
  € — and ₴ (U+20B4) is assigned to `cyrillic-ext`, which next/font's own font
  metadata does not even list for Geist (it knows only latin, latin-ext and
  cyrillic). Whatever combination of those three is requested, no @font-face
  range claims U+20B4, so every price on the site would render its currency
  sign in the fallback font.

  Vercel's own distribution of the family has no such split: `Geist-Variable`
  is one 69 KB variable file with all 728 glyphs — checked with fontTools for
  і ї є ґ І Ї Є Ґ ʼ № ₴ « » ’ – —, all present, nothing Ukrainian falling
  through. One file carries every weight 400–700, which is fewer bytes than
  the three Google subsets that cannot render ₴.
*/
const geist = localFont({
  src: './fonts/Geist-Variable.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-geist',
  display: 'swap',
});

const SITE = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: `${BRAND_NAME} — колекційний листовий чай прямих поставок`,
    template: `%s · ${BRAND_NAME}`,
  },
  description:
    'Інтернет-магазин колекційного листового чаю: пуер, улун, зелений, червоний і білий чай зі старих дерев Юньнані й Тайваню. Доставка по Україні.',
  applicationName: BRAND_NAME,
  keywords: ['чай', 'пуер', 'улун', 'зелений чай', 'білий чай', 'листовий чай', 'купити чай Україна'],
  authors: [{ name: BRAND_NAME }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    siteName: BRAND_NAME,
    url: SITE,
    title: `${BRAND_NAME} — колекційний листовий чай прямих поставок`,
    description:
      'Пуер, улун, зелений, червоний і білий чай зі старих дерев. Невеликі партії, чесне походження. Доставка по Україні.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_NAME} — колекційний листовий чай`,
    description: 'Колекційний листовий чай прямих поставок. Доставка по Україні.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fdfcf9',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={geist.variable}>
      <body className="font-sans antialiased">
        <GoogleTagManagerNoScript />
        <GoogleTagManager />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <OrganizationJsonLd siteUrl={SITE} />
        <WebSiteJsonLd siteUrl={SITE} />
        <CartProvider>
          {/* The shell pins the footer to the bottom of a short page (an empty
              cart, an article stub) instead of leaving a band of paper under it. */}
          <div className="flex min-h-dvh flex-col [&>footer]:mt-auto">{children}</div>
        </CartProvider>
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
