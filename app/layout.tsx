import type { Metadata, Viewport } from 'next';
import { Oswald, PT_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { OrganizationJsonLd } from '@/components/JsonLd';
import { Toaster } from '@/components/ui/sonner';
import { siteUrl } from '@/lib/format';

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
    default: 'jintea.shop — колекційний листовий чай прямих поставок',
    template: '%s · jintea.shop',
  },
  description:
    'Інтернет-магазин колекційного листового чаю: пуер, улун, зелений, червоний і білий чай зі старих дерев Юньнані й Тайваню. Доставка по Україні.',
  applicationName: 'jintea.shop',
  keywords: ['чай', 'пуер', 'улун', 'зелений чай', 'білий чай', 'листовий чай', 'купити чай Україна'],
  authors: [{ name: 'jintea.shop' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    siteName: 'jintea.shop',
    url: SITE,
    title: 'jintea.shop — колекційний листовий чай прямих поставок',
    description:
      'Пуер, улун, зелений, червоний і білий чай зі старих дерев. Невеликі партії, чесне походження. Доставка по Україні.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'jintea.shop — колекційний листовий чай',
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
        <OrganizationJsonLd siteUrl={SITE} />
        <CartProvider>
          <div className="app-shell">{children}</div>
        </CartProvider>
        <Toaster />
      </body>
    </html>
  );
}
