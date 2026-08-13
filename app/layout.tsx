import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Oswald, PT_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { OrganizationJsonLd } from '@/components/JsonLd';
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
  PageViewTracker,
} from '@/components/Analytics';
import { Toaster } from '@/components/ui/sonner';
import { CookieConsent } from '@/components/CookieConsent';
import { siteUrl } from '@/lib/format';
import { SITE_NAME } from '@/lib/contacts';

const oswald = Oswald({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

const ptSans = PT_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
  display: 'swap',
});

const SITE = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: `${SITE_NAME} — колекційний листовий чай прямих поставок`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    'Інтернет-магазин колекційного листового чаю: пуер, улун, зелений, червоний і білий чай зі старих дерев Юньнані й Тайваню. Доставка по Україні.',
  applicationName: SITE_NAME,
  keywords: ['чай', 'пуер', 'улун', 'зелений чай', 'білий чай', 'листовий чай', 'купити чай Україна'],
  authors: [{ name: SITE_NAME }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    siteName: SITE_NAME,
    url: SITE,
    title: `${SITE_NAME} — колекційний листовий чай прямих поставок`,
    description:
      'Пуер, улун, зелений, червоний і білий чай зі старих дерев. Невеликі партії, чесне походження. Доставка по Україні.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — колекційний листовий чай`,
    description: 'Колекційний листовий чай прямих поставок. Доставка по Україні.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2E4631',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${oswald.variable} ${ptSans.variable}`}>
      <body className="font-body">
        <GoogleTagManagerNoScript />
        <GoogleTagManager />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <OrganizationJsonLd siteUrl={SITE} />
        <CartProvider>
          <div className="app-shell">{children}</div>
        </CartProvider>
        <CookieConsent />
        <Toaster />
      </body>
    </html>
  );
}
