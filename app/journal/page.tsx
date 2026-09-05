import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArticleCard } from '@/components/ArticleCard';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { articlesByDate } from '@/lib/journal';
import { siteUrl } from '@/lib/format';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Журнал',
  description:
    'Про пуер, Юньнань і чайну практику: гіди з видів чаю, походження сировини та заварювання гунфу ча.',
  alternates: { canonical: '/journal' },
  openGraph: {
    type: 'website',
    title: 'Журнал',
    description: 'Про пуер, Юньнань і чайну практику.',
    url: '/journal',
    locale: 'uk_UA',
  },
};

export default function JournalPage() {
  const articles = articlesByDate();

  return (
    <>
      <BreadcrumbJsonLd
        siteUrl={siteUrl()}
        items={[
          { name: 'Головна', path: '/' },
          { name: 'Журнал', path: '/journal' },
        ]}
      />
      <Header title="Журнал" back />

      <main className="mx-auto max-w-content px-5 pb-16 lg:px-8">
        <h1 className="m-0 font-display text-h2 uppercase text-ink">Журнал</h1>
        <p className="mt-3 max-w-[60ch] font-body text-body text-ink-soft">
          Про пуер, Юньнань і чайну практику — без езотерики, з тим, що можна перевірити за
          чашкою.
        </p>

        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <ArticleCard key={a.slug} article={a} priority={i === 0} />
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
