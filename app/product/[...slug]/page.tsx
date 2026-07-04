import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { ProductImage } from '@/components/Logo';
import { ProductBuy } from '@/components/ProductBuy';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import { Badge } from '@/components/ui/badge';
import { getProduct, allProductSlugs, categoryLabel, UNIT } from '@/lib/products';
import { uah, siteUrl } from '@/lib/format';

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
    const description = product.description.slice(0, 160);
    const url = `/product/${product.slug}`;

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
            type: 'website',
            title: `${product.title} · jintea.shop`,
            description,
            url,
            locale: 'uk_UA',
            ...(product.image ? { images: [{ url: product.image, alt: product.title }] } : {}),
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.title} · jintea.shop`,
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
    const hasTiers = product.priceTiers.length > 1;

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

            <article className="animate-screenIn lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start lg:max-w-[1080px] lg:mx-auto lg:px-8 lg:py-10">
                <div className="px-4 pt-2 lg:px-0 lg:pt-0 lg:sticky lg:top-20">
                    <ProductImage
                        src={product.image}
                        category={product.category}
                        alt={`${product.title} — ${product.subtitle}`}
                        ratio="4 / 5"
                        radius={22}
                        tag="фото товару"
                        priority
                        sizes="(max-width: 480px) 100vw, (max-width: 1024px) 720px, 520px"
                    />
                </div>

                <div className="lg:min-w-0">
                    <div className="px-[18px] pt-[18px] pb-1 lg:px-0 lg:pt-0">
                        <div className="flex gap-2 mb-3">
                            <Badge>{categoryLabel(product.category)}</Badge>
                            {product.inStock ? (
                                <Badge variant="ok">В наявності</Badge>
                            ) : (
                                <Badge variant="danger">Немає</Badge>
                            )}
                        </div>

                        <h1 className="font-display font-semibold text-[27px] lg:text-[34px] leading-tight text-ink">
                            {product.title}
                        </h1>
                        <p className="mt-1.5 text-ink-soft text-[15.5px] lg:text-[17px] italic">{product.subtitle}</p>

                        <div className="flex items-baseline gap-2.5 mt-4 mb-[18px]">
              <span className="font-display font-semibold text-[30px] lg:text-[36px] text-green-deep">
                {product.price != null ? `${hasTiers ? 'від ' : ''}${uah(product.price)}` : 'Ціна за запитом'}
              </span>
                            {product.weight ? (
                                <span className="text-ink-faint text-[14px]">
                  за {product.weight} {UNIT}
                </span>
                            ) : null}
                        </div>

                        <dl className="bg-card rounded-lg shadow-sh-1 overflow-hidden mb-[18px] m-0">
                            {product.weight ? (
                                <>
                                    <SpecRow k="Вага" v={`${product.weight} ${UNIT}`} />
                                    <hr className="divider" />
                                </>
                            ) : null}
                            <SpecRow k="Категорія" v={categoryLabel(product.category)} />
                        </dl>

                        <h2 className="font-display text-[14px] tracking-[0.1em] uppercase text-green-deep mb-1.5">Опис</h2>
                        <p className="m-0 text-ink-soft text-[15.5px] lg:text-[16px] leading-relaxed text-pretty">
                            {product.description}
                        </p>
                    </div>

                    <ProductBuy product={product} />
                </div>
            </article>
        </>
    );
}

function SpecRow({ k, v }: { k: string; v: string }) {
    return (
        <div className="flex justify-between items-center px-4 py-[13px] min-h-[48px]">
            <dt className="text-ink-faint text-[14px]">{k}</dt>
            <dd className="font-display font-medium text-[15px] text-ink m-0">{v}</dd>
        </div>
    );
}