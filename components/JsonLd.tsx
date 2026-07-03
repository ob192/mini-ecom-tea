import type { Product } from '@/lib/types';
import { categoryLabel } from '@/lib/products';

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
                name: 'TEA CHE',
                description: 'Колекційний листовий чай прямих поставок з Юньнані й Тайваню.',
                url: siteUrl,
                logo: `${siteUrl}/icon.png`,
                email: 'hello@teache.ua',
                telephone: '+380971234567',
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Київ',
                    streetAddress: 'вул. Чайна, 7',
                    addressCountry: 'UA',
                },
            }}
        />
    );
}

export function ProductJsonLd({ product, siteUrl }: { product: Product; siteUrl: string }) {
    const url = `${siteUrl}/product/${product.slug}`;
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: product.title,
                description: product.description,
                category: categoryLabel(product.category),
                sku: product.slug,
                ...(product.image ? { image: product.images.map((i) => `${siteUrl}${i}`) } : {}),
                brand: { '@type': 'Brand', name: 'TEA CHE' },
                ...(product.price != null
                    ? {
                        offers: {
                            '@type': 'Offer',
                            url,
                            priceCurrency: 'UAH',
                            price: product.price,
                            availability: product.inStock
                                ? 'https://schema.org/InStock'
                                : 'https://schema.org/OutOfStock',
                            itemCondition: 'https://schema.org/NewCondition',
                        },
                    }
                    : {}),
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