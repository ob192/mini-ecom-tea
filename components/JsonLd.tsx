import type { Product } from '@/lib/types';
import { categoryLabel, CURRENCY } from '@/lib/products';
import { flattenDescription } from '@/lib/format';
import { offerId } from '@/lib/merchant-feed';
import { CONTACT_EMAIL, INSTAGRAM_URL, BRAND_NAME, TELEGRAM_URL } from '@/lib/contacts';
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, RETURN_WINDOW_DAYS } from '@/lib/shipping';

function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
    );
}

/**
 * Google's "Merchant listings" report treats an Offer without a price validity
 * date as incomplete. Nothing here expires — the horizon is just far enough out
 * that a listing never goes stale between deploys.
 */
function priceValidUntil(): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
}

/**
 * Delivery and returns, as structured data.
 *
 * Google cross-checks these against both the Merchant Center feed and the
 * visible policy pages, so every number is imported rather than written out:
 * the rate matches `g:shipping`, and the return window matches /returns. The
 * shipping rate is what an order containing only this offer would cost, which
 * is the same rule `shippingFor()` applies in lib/merchant-feed.ts.
 */
function shippingDetails(price: number) {
    return {
        '@type': 'OfferShippingDetails',
        shippingRate: {
            '@type': 'MonetaryAmount',
            value: price >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE,
            currency: CURRENCY,
        },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'UA' },
        deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            // Ordered before 18:00 ships the same day, after 18:00 the next
            // working day — /delivery states both.
            handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
        },
    };
}

const RETURN_POLICY = {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'UA',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: RETURN_WINDOW_DAYS,
    returnMethod: 'https://schema.org/ReturnByMail',
    // "Оплата доставки повернення відбувається за рахунок покупця" — /returns.
    returnFees: 'https://schema.org/ReturnShippingFees',
};

/**
 * Names the site for Google's sitename feature, which otherwise guesses from
 * the domain — and the domain here is a technical subdomain, not the brand.
 */
export function WebSiteJsonLd({ siteUrl }: { siteUrl: string }) {
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: BRAND_NAME,
                alternateName: `${BRAND_NAME} — листовий чай`,
                url: siteUrl,
                inLanguage: 'uk-UA',
                publisher: { '@type': 'Organization', name: BRAND_NAME, '@id': `${siteUrl}/#organization` },
            }}
        />
    );
}

/**
 * The catalogue as an ordered list of products. Gives Google an explicit map of
 * the storefront from the one page that links to everything, instead of leaving
 * it to infer the set by crawling.
 */
export function ItemListJsonLd({
                                   products,
                                   siteUrl,
                               }: {
    products: Product[];
    siteUrl: string;
}) {
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: `Каталог ${BRAND_NAME}`,
                numberOfItems: products.length,
                itemListElement: products.map((p, i) => ({
                    '@type': 'ListItem',
                    position: i + 1,
                    name: p.title,
                    url: `${siteUrl}/product/${p.slug}`,
                })),
            }}
        />
    );
}

export function OrganizationJsonLd({ siteUrl }: { siteUrl: string }) {
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'Organization',
                // Stable node id so WebSite/publisher and any future Product
                // seller reference resolve to this one entity rather than
                // creating duplicates.
                '@id': `${siteUrl}/#organization`,
                name: BRAND_NAME,
                description: 'Колекційний листовий чай прямих поставок з Юньнані й Тайваню.',
                url: siteUrl,
                // app/icon.svg is the only logo asset that exists; /icon.png 404s.
                logo: `${siteUrl}/icon.svg`,
                email: CONTACT_EMAIL,
                telephone: '+380986575800',
                sameAs: [INSTAGRAM_URL, TELEGRAM_URL],
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
        priceValidUntil: priceValidUntil(),
        availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: BRAND_NAME },
        shippingDetails: shippingDetails(price),
        hasMerchantReturnPolicy: RETURN_POLICY,
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
                brand: { '@type': 'Brand', name: BRAND_NAME },
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