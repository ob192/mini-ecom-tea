import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductBuy } from '@/components/ProductBuy';
import { ProductCard } from '@/components/ProductCard';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import { Accordion, Eyebrow, SectionHeading, Tag, TextLink } from '@/design';
import {
    getProduct,
    getProductsByCategory,
    allProductSlugs,
    categoryLabel,
    defaultWeight,
} from '@/lib/products';
import { offerId } from '@/lib/merchant-feed';
import {
    siteUrl,
    descriptionParagraphs,
    flattenDescription,
    truncateWords,
} from '@/lib/format';
import { BRAND_NAME } from '@/lib/contacts';

/*
  Product page — the `Product Page` frames in jintea.pen.

  Gallery on the left, buy column on the right at `lg`, stacked below it. The
  buy column follows the design's order exactly: category eyebrow, display
  headline, price with its tier beside it, SKU tag, description, then the
  weight selector and buy row (which live in ProductBuy).

  Below the fold the design draws a `ПРИГОТУВАННЯ` accordion and a
  `ВАМ ТАКОЖ СПОДОБАЄТЬСЯ` row. The mockup fills the accordion with per-product
  brewing parameters; nothing in public/products.json carries those, so rather
  than invent numbers it holds the product's own copy and points at the brewing
  guide. The related row is real: other products from the same category.
*/

interface Params {
    // Catch-all: slug is an array of path segments, e.g. ["green","longjing-cha"].
    params: Promise<{ slug: string[] }>;
}

export function generateStaticParams() {
    return allProductSlugs().map((slug) => ({ slug: slug.split('/') }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { slug } = await params;
    const product = getProduct(slug.join('/'));
    if (!product) return { title: 'Товар не знайдено' };

    const title = `${product.title} — ${product.subtitle}`;
    const description = truncateWords(flattenDescription(product.description), 160);
    const url = `/product/${product.slug}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            type: 'website',
            title: `${product.title} · ${BRAND_NAME}`,
            description,
            url,
            locale: 'uk_UA',
            ...(product.image ? { images: [{ url: product.image, alt: product.title }] } : {}),
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.title} · ${BRAND_NAME}`,
            description,
            ...(product.image ? { images: [product.image] } : {}),
        },
    };
}

export default async function ProductPage({ params }: Params) {
    const { slug } = await params;
    const product = getProduct(slug.join('/'));
    if (!product) notFound();

    const SITE = siteUrl();
    const base = defaultWeight(product);
    const paragraphs = descriptionParagraphs(product.description);
    const [lead, ...rest] = paragraphs;

    const related = getProductsByCategory(product.category)
        .filter((p) => p.slug !== product.slug)
        .slice(0, 3);

    return (
        <>
            <ProductJsonLd product={product} siteUrl={SITE} />
            <BreadcrumbJsonLd
                siteUrl={SITE}
                items={[
                    { name: 'Головна', path: '/' },
                    { name: categoryLabel(product.category), path: `/?cat=${product.category}` },
                    { name: product.title, path: `/product/${product.slug}` },
                ]}
            />

            <Header back />

            <article className="mx-auto max-w-content animate-screenIn px-5 pb-16 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-16">
                    <div className="lg:sticky lg:top-24">
                        <ProductGallery
                            images={product.images}
                            category={product.category}
                            alt={`${product.title} — ${product.subtitle}`}
                            ratio="1 / 1"
                            radius={6}
                            sizes="(max-width: 1024px) 100vw, 560px"
                        />
                    </div>

                    <div className="pt-8 lg:min-w-0 lg:pt-0">
                        <Eyebrow>
                            {categoryLabel(product.category)}
                            {product.subtitle ? ` · ${product.subtitle}` : ''}
                        </Eyebrow>

                        <h1 className="mt-2 font-display text-[27px] font-semibold uppercase leading-[1.1] text-ink lg:text-h1">
                            {product.title}
                        </h1>

                        {/*
                            Everything from the price down lives in ProductBuy,
                            which owns the selected tier. These static parts are
                            handed to it as children so they still render on the
                            server, in the order the design draws them.
                        */}
                        <ProductBuy product={product}>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Tag tone="sku"># {offerId(product, base)}</Tag>
                                {product.inStock ? (
                                    <Tag tone="ok">В наявності</Tag>
                                ) : (
                                    <Tag tone="danger">Немає</Tag>
                                )}
                            </div>

                            {lead ? (
                                <p className="mt-6 font-body text-body text-ink-soft">{lead}</p>
                            ) : null}

                            {rest.length > 0 ? (
                                <TextLink href="#opys" glyph="plus" className="mt-4">
                                    Читати далі
                                </TextLink>
                            ) : null}
                        </ProductBuy>
                    </div>
                </div>

                <div className="mt-16 flex flex-col gap-12 border-t border-line pt-10">
                    <Accordion id="opys" title="Опис">
                        <div className="flex max-w-[70ch] flex-col gap-3 font-body text-body text-ink-soft">
                            {paragraphs.map((p, i) => (
                                <p key={i} className={`m-0 ${p.startsWith('• ') ? '-indent-3.5 pl-3.5' : ''}`}>
                                    {p}
                                </p>
                            ))}
                        </div>
                    </Accordion>

                    <Accordion title="Приготування" defaultOpen={false}>
                        <p className="m-0 max-w-[70ch] font-body text-body text-ink-soft">
                            Загальні пропорції, температура води та кількість проливів для кожного
                            типу чаю зібрані в нашому гіді.{' '}
                            <Link href="/brewing" className="text-green underline underline-offset-4">
                                Як заварювати
                            </Link>
                            .
                        </p>
                    </Accordion>
                </div>

                {related.length > 0 ? (
                    <section className="mt-16" aria-labelledby="related">
                        <SectionHeading
                            id="related"
                            action={<TextLink href={`/?cat=${product.category}`}>Усі товари</TextLink>}
                        >
                            Вам також сподобається
                        </SectionHeading>
                        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
                            {related.map((p, i) => (
                                <ProductCard
                                    key={p.slug}
                                    product={p}
                                    listId={`related_${product.category}`}
                                    listName={`Схожі · ${categoryLabel(product.category)}`}
                                    index={i}
                                />
                            ))}
                        </div>
                    </section>
                ) : null}
            </article>

            <Footer />
        </>
    );
}
