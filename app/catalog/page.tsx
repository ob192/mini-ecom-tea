import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CatalogGrid } from '@/components/CatalogGrid';
import { ItemListJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import { products, categories } from '@/lib/products';
import { siteUrl } from '@/lib/format';

export const dynamic = 'force-static';

/*
  /catalog — the full, filterable catalogue.

  It used to be the home page. The jintea.pen home frame has no catalogue grid
  on it at all: it shows one curated row and links onward with «УСІ ТОВАРИ →».
  So the browse experience moved here, and every `?cat=` link in the header,
  the footer and the product breadcrumbs now points at this route.

  The ItemList structured data moved with it — it describes this page's list of
  products, and leaving it on a home page that no longer renders that list
  would be a mismatch between the markup and what Google crawls.
*/
export const metadata: Metadata = {
  title: 'Каталог',
  description:
    'Увесь листовий чай і посуд Jintea: пуер, улун, зелений, червоний і білий чай, гайвані, чайники та аксесуари. Доставка по Україні.',
  alternates: { canonical: '/catalog' },
  openGraph: {
    type: 'website',
    title: 'Каталог',
    description: 'Увесь листовий чай і посуд Jintea. Доставка по Україні.',
    url: '/catalog',
    locale: 'uk_UA',
  },
};

export default function CatalogPage() {
  return (
    <>
      <ItemListJsonLd products={products} siteUrl={siteUrl()} />
      <BreadcrumbJsonLd
        siteUrl={siteUrl()}
        items={[
          { name: 'Головна', path: '/' },
          { name: 'Каталог', path: '/catalog' },
        ]}
      />
      <Header title="Каталог" back />

      <main>
        <h1 className="mx-auto max-w-content px-5 pt-4 font-display text-h2 uppercase text-ink lg:px-8">
          Каталог
        </h1>
        <Suspense
          fallback={
            <div className="mx-auto max-w-content px-5 py-16 font-body text-small text-ink-faint lg:px-8">
              Завантаження каталогу…
            </div>
          }
        >
          <CatalogGrid products={products} categories={categories} />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
