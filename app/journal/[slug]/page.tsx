import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArticleCard } from '@/components/ArticleCard';
import { BreadcrumbJsonLd, ArticleJsonLd } from '@/components/JsonLd';
import { SectionHeading, TextLink, Eyebrow } from '@/design';
import { articles, getArticle } from '@/lib/journal';
import { descriptionParagraphs, siteUrl } from '@/lib/format';
import { BRAND_NAME } from '@/lib/contacts';

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: 'Статтю не знайдено' };

  const url = `/journal/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: `${article.title} · ${BRAND_NAME}`,
      description: article.excerpt,
      url,
      locale: 'uk_UA',
      publishedTime: article.published,
      images: [{ url: article.cover, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.cover],
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const SITE = siteUrl();
  const paragraphs = descriptionParagraphs(article.body);
  const more = articles.filter((a) => a.slug !== article.slug).slice(0, 2);

  return (
    <>
      <ArticleJsonLd article={article} siteUrl={SITE} />
      <BreadcrumbJsonLd
        siteUrl={SITE}
        items={[
          { name: 'Головна', path: '/' },
          { name: 'Журнал', path: '/journal' },
          { name: article.title, path: `/journal/${article.slug}` },
        ]}
      />

      <Header title={article.title} back />

      <article className="mx-auto max-w-content px-5 pb-16 lg:px-8">
        <header className="max-w-[70ch]">
          <Eyebrow>{article.category}</Eyebrow>
          <h1 className="mt-2 font-display text-[27px] font-semibold leading-[1.12] text-ink lg:text-h1">
            {article.title}
          </h1>
          <time
            dateTime={article.published}
            className="mt-3 block font-body text-small text-ink-faint"
          >
            {new Date(article.published).toLocaleDateString('uk-UA', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
        </header>

        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-lg shadow-hairline">
          <Image
            src={article.cover}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover"
          />
        </div>

        <div className="mt-10 flex max-w-[70ch] flex-col gap-4 font-body text-body text-ink-soft">
          {paragraphs.map((p, i) => (
            <p key={i} className={`m-0 ${p.startsWith('• ') ? '-indent-3.5 pl-3.5' : ''}`}>
              {p}
            </p>
          ))}
        </div>

        {more.length > 0 ? (
          <section className="mt-16 border-t border-line pt-10" aria-labelledby="more">
            <SectionHeading id="more" action={<TextLink href="/journal">Усі статті</TextLink>}>
              Читати далі
            </SectionHeading>
            <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2">
              {more.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        ) : null}
      </article>

      <Footer />
    </>
  );
}
