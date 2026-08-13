import type { Product } from '@/lib/types';
import { categoryLabel } from '@/lib/products';
import { flattenDescription } from '@/lib/format';
import { offerId } from '@/lib/merchant-feed';

function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
    );
}

export function OrganizationJsonLd({ siteUrl }: { siteUrl: string }) {
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'jintea.shop',
                description: 'Колекційний листовий чай прямих поставок з Юньнані й Тайваню.',
                url: siteUrl,
                // app/icon.svg is the only logo asset that exists; /icon.png 404s.
                logo: `${siteUrl}/icon.svg`,
                email: 'hello@jintea.shop',
                telephone: '+380986575800',
                sameAs: ['https://instagram.com/jintea.ua', 'https://t.me/Jin_tea'],
            }}
        />
    );
}

export function ProductJsonLd({ product, siteUrl }: { product: Product; siteUrl: string }) {
    const url = `${siteUrl}/product/${product.slug}`;
    const tiered = product.priceTiers.length > 1;

    const offer = (sku: string, price: number) => ({
        '@type': 'Offer',
        url,
        sku,
        priceCurrency: 'UAH',
        price,
        availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
    });

    // One Offer per weight tier, each keyed by the same sku the Merchant Center
    // feed uses (`lib/merchant-feed.ts`). Publishing only the "від ..." base
    // price here makes Google read every larger tier as a price mismatch.
    const offers = tiered
        ? product.priceTiers.map((t) => offer(offerId(product, t.weight), t.price))
        : product.price != null
            ? [offer(offerId(product, null), product.price)]
            : [];

    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: product.title,
                description: flattenDescription(product.description),
                category: categoryLabel(product.category),
                sku: product.slug,
                ...(product.image ? { image: product.images.map((i) => `${siteUrl}${i}`) } : {}),
                brand: { '@type': 'Brand', name: 'jintea.shop' },
                ...(offers.length > 0 ? { offers: offers.length === 1 ? offers[0] : offers } : {}),
            }}
        />
    );
}

export function BreadcrumbJsonLd({
                                     items,
                                     siteUrl,
                                 }: {
    items: { name: string; path: string }[];
    siteUrl: string;
}) {
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: items.map((it, i) => ({
                    '@type': 'ListItem',
                    position: i + 1,
                    name: it.name,
                    item: `${siteUrl}${it.path}`,
                })),
            }}
        />
    );
}