import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { CatalogGrid } from '@/components/CatalogGrid';
import { products, categories } from '@/lib/products';

// Fully static — no per-request work.
export const dynamic = 'force-static';

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <div id="catalog" className="flex flex-col min-h-[40vh]">
        <Suspense
          fallback={<div className="px-[18px] py-10 text-ink-faint text-sm">Завантаження каталогу…</div>}
        >
          <CatalogGrid products={products} categories={categories} />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
