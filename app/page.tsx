import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { CatalogGrid } from '@/components/CatalogGrid';
import { products, categories } from '@/lib/products';
import { ItemListJsonLd } from '@/components/JsonLd';
import { siteUrl } from '@/lib/format';

export const dynamic = 'force-static';

/*
  Home — the `Home Page` frames in jintea.pen: header, full-bleed hero,
  the `Explore` catalogue, footer.

  The catalogue wrapper is a plain block, not a flex column. Its children
  centre themselves with `mx-auto max-w-content`, and an auto cross-axis margin
  on a flex item makes that item shrink to its content instead of filling the
  row — which quietly collapsed every section to its own width.
*/
export default function HomePage() {
  return (
    <>
      <ItemListJsonLd products={products} siteUrl={siteUrl()} />
      <Header />
      <Hero />
      <div id="catalog" className="min-h-[40vh] scroll-mt-[60px]">
        <Suspense
          fallback={
            <div className="mx-auto max-w-content px-5 py-16 font-body text-small text-ink-faint lg:px-8">
              Завантаження каталогу…
            </div>
          }
        >
          <CatalogGrid products={products} categories={categories} />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
