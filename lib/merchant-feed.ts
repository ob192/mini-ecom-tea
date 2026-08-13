/**
 * Google Merchant Center product feed (RSS 2.0 + the `g:` namespace).
 *
 * Served statically from `app/google-merchant.xml/route.ts`; register that URL
 * as a scheduled fetch in Merchant Center. See `docs/merchant-feed.md`.
 *
 * The catalogue has no GTINs/MPNs (single-origin tea and one-off teaware), so
 * every offer declares `identifier_exists: no` and relies on brand + title.
 *
 * Weight tiers become variants: one offer per `{weight, price}` pair, tied
 * together by `item_group_id` (the product slug). The per-tier prices must be
 * findable on the landing page or Merchant Center reports a price mismatch —
 * that is why `components/JsonLd.tsx` emits one schema.org Offer per tier with
 * the same `sku` as the feed `id` here.
 */

import { products, categoryLabel, CURRENCY, UNIT } from '@/lib/products';
import { flattenDescription, truncateWords } from '@/lib/format';
import { SITE_NAME } from '@/lib/contacts';
import type { CategorySlug, Product } from '@/lib/types';

/** Public path of the feed route. */
export const FEED_PATH = '/google-merchant.xml';

export const FEED_TITLE = `${SITE_NAME} — листовий чай і чайне приладдя`;
export const FEED_DESCRIPTION =
  'Колекційний листовий чай прямих поставок з Юньнані й Тайваню, гайвані, чайники, піали та аксесуари.';

/** Merchant Center `brand`. Matches the schema.org Brand on product pages. */
export const BRAND = SITE_NAME;

export const SHIPPING_COUNTRY = 'UA';
export const SHIPPING_SERVICE = 'Нова Пошта';

// Duplicated from context/CartContext.tsx and app/api/order/route.ts, which
// already duplicate each other — there is no shared config module. Keep all
// three in sync.
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 100;

/** GMC hard limits (https://support.google.com/merchants/answer/7052112). */
const MAX_ID_LENGTH = 50;
const MAX_TITLE_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_ADDITIONAL_IMAGES = 10;

/**
 * Google product taxonomy ids (taxonomy-with-ids.en-US).
 * Numeric ids are used rather than the path strings — they never drift when
 * Google renames a branch.
 */
export const GOOGLE_CATEGORY: Record<CategorySlug, number> = {
  puer: 2073, // Food, Beverages & Tobacco > Beverages > Tea & Infusions
  green: 2073,
  oolong: 2073,
  red: 2073,
  white: 2073,
  set: 6740, // Home & Garden > Kitchen & Dining > Tableware > Coffee & Tea Sets
  gaiwan: 652, // Home & Garden > Kitchen & Dining > Tableware > Coffee Servers & Tea Pots
  teapot: 652,
  piala: 6049, // Home & Garden > Kitchen & Dining > Tableware > Drinkware > Coffee & Tea Cups
  accessory: 4559, // Home & Garden > Kitchen & Dining > Kitchen Tools & Utensils > Tea Strainers
  figurine: 5609, // Home & Garden > Decor > Figurines
};

/**
 * Per-product overrides, for the items their category slug misclassifies:
 * the "Старт МІНІ" set is tea, not teaware, and a chahai is a serving pitcher
 * rather than a strainer.
 */
export const GOOGLE_CATEGORY_BY_SLUG: Record<string, number> = {
  'set/start-mini-7': 2073,
  'accessory/chahai-glass-285ml': 3330, // ... > Tableware > Serveware > Serving Pitchers & Carafes
};

/** Our own `product_type` taxonomy, shown in Merchant Center reports. */
const PRODUCT_TYPE_ROOT: Record<CategorySlug, string> = {
  puer: 'Чай',
  green: 'Чай',
  oolong: 'Чай',
  red: 'Чай',
  white: 'Чай',
  set: 'Набори',
  gaiwan: 'Чайне приладдя',
  teapot: 'Чайне приладдя',
  piala: 'Чайне приладдя',
  accessory: 'Чайне приладдя',
  figurine: 'Декор',
};

/** One `<item>` in the feed — a single purchasable offer. */
export interface FeedItem {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImageLinks: string[];
  availability: 'in_stock' | 'out_of_stock';
  /** Formatted for GMC, e.g. "350.00 UAH". */
  price: string;
  condition: 'new';
  brand: string;
  identifierExists: false;
  googleProductCategory: number;
  productType: string;
  /** Set only for products with more than one weight tier. */
  itemGroupId?: string;
  /** Variant-differentiating attribute, e.g. "50 г". */
  size?: string;
  /** e.g. "50 g" — drives the per-100 g unit price in Shopping. */
  unitPricingMeasure?: string;
  unitPricingBaseMeasure?: string;
  shippingPrice: string;
}

/** Why a catalogue entry cannot be listed. */
export interface FeedExclusion {
  slug: string;
  reason: string;
}

function absolute(base: string, path: string): string {
  return `${base}${path}`;
}

function money(amount: number): string {
  return `${amount.toFixed(2)} ${CURRENCY}`;
}

export function googleCategoryFor(product: Product): number {
  return GOOGLE_CATEGORY_BY_SLUG[product.slug] ?? GOOGLE_CATEGORY[product.category];
}

export function productTypeFor(product: Product): string {
  const root = PRODUCT_TYPE_ROOT[product.category];
  const leaf = categoryLabel(product.category);
  return root === leaf ? root : `${root} > ${leaf}`;
}

/**
 * Merchant Center titles work best as "product, size — what it is".
 * Truncated on a word boundary rather than cut mid-word at 150.
 */
function titleFor(product: Product, weight: number | null, tiered: boolean): string {
  const withSize = tiered && weight ? `${product.title}, ${weight} ${UNIT}` : product.title;
  const full = product.subtitle ? `${withSize} — ${product.subtitle}` : withSize;
  return truncateWords(full, MAX_TITLE_LENGTH);
}

/**
 * Shipping as the customer would actually be charged for an order containing
 * only this item: free once the item alone clears the free-delivery threshold.
 */
function shippingFor(price: number): string {
  return money(price >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE);
}

/**
 * Every offer in the catalogue, one per weight tier.
 * `siteUrl` must be an absolute origin with no trailing slash.
 */
export function buildFeedItems(siteUrl: string): FeedItem[] {
  const items: FeedItem[] = [];

  for (const product of products) {
    if (feedExclusionFor(product)) continue;

    const tiered = product.priceTiers.length > 1;
    const offers: { weight: number | null; price: number }[] =
      product.priceTiers.length > 0
        ? product.priceTiers.map((t) => ({ weight: t.weight, price: t.price }))
        : [{ weight: product.weight, price: product.price as number }];

    for (const offer of offers) {
      items.push({
        id: offerId(product, tiered ? offer.weight : null),
        title: titleFor(product, offer.weight, tiered),
        description: truncateWords(flattenDescription(product.description), MAX_DESCRIPTION_LENGTH),
        link: absolute(siteUrl, `/product/${product.slug}`),
        imageLink: absolute(siteUrl, product.images[0]),
        additionalImageLinks: product.images
          .slice(1, 1 + MAX_ADDITIONAL_IMAGES)
          .map((i) => absolute(siteUrl, i)),
        availability: 'in_stock',
        price: money(offer.price),
        condition: 'new',
        brand: BRAND,
        identifierExists: false,
        googleProductCategory: googleCategoryFor(product),
        productType: productTypeFor(product),
        ...(tiered ? { itemGroupId: product.slug } : {}),
        ...(tiered && offer.weight ? { size: `${offer.weight} ${UNIT}` } : {}),
        ...(offer.weight
          ? { unitPricingMeasure: `${offer.weight} g`, unitPricingBaseMeasure: '100 g' }
          : {}),
        shippingPrice: shippingFor(offer.price),
      });
    }
  }

  return items;
}

/**
 * Feed `id` for a product/tier. Also used as the schema.org `sku` on the
 * product page so Merchant Center can match a crawled offer to a feed row —
 * change one and you must change the other.
 */
export function offerId(product: Product, weight: number | null): string {
  return weight ? `${product.slug}-${weight}g` : product.slug;
}

/** Non-null when the product cannot be submitted, explaining why. */
export function feedExclusionFor(product: Product): FeedExclusion | null {
  if (product.price == null) return { slug: product.slug, reason: 'no price' };
  // image_link is required; a placeholder gradient is not a product photo.
  if (product.images.length === 0) return { slug: product.slug, reason: 'no image' };
  return null;
}

/** Everything skipped, for build-time logging and tests. */
export function feedExclusions(): FeedExclusion[] {
  return products.map(feedExclusionFor).filter((e): e is FeedExclusion => e !== null);
}

/**
 * XML 1.0 forbids most C0 control characters outright — they cannot be escaped,
 * only removed, and one stray byte in a description invalidates the whole feed.
 */
function xmlEscape(value: string): string {
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function tag(name: string, value: string | number): string {
  return `    <${name}>${xmlEscape(String(value))}</${name}>`;
}

function optionalTag(name: string, value: string | undefined): string[] {
  return value ? [tag(name, value)] : [];
}

function renderItem(item: FeedItem): string {
  const lines = [
    '  <item>',
    tag('g:id', item.id),
    tag('g:title', item.title),
    tag('g:description', item.description),
    tag('g:link', item.link),
    tag('g:image_link', item.imageLink),
    ...item.additionalImageLinks.map((url) => tag('g:additional_image_link', url)),
    tag('g:availability', item.availability),
    tag('g:price', item.price),
    tag('g:condition', item.condition),
    tag('g:brand', item.brand),
    tag('g:identifier_exists', 'no'),
    tag('g:google_product_category', item.googleProductCategory),
    tag('g:product_type', item.productType),
    ...optionalTag('g:item_group_id', item.itemGroupId),
    ...optionalTag('g:size', item.size),
    ...optionalTag('g:unit_pricing_measure', item.unitPricingMeasure),
    ...optionalTag('g:unit_pricing_base_measure', item.unitPricingBaseMeasure),
    '    <g:shipping>',
    `      <g:country>${SHIPPING_COUNTRY}</g:country>`,
    `      <g:service>${xmlEscape(SHIPPING_SERVICE)}</g:service>`,
    `      <g:price>${xmlEscape(item.shippingPrice)}</g:price>`,
    '    </g:shipping>',
    '  </item>',
  ];
  return lines.join('\n');
}

/** The complete feed document. */
export function renderFeed(siteUrl: string, items: FeedItem[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '<channel>',
    tag('title', FEED_TITLE).trimStart(),
    tag('link', siteUrl).trimStart(),
    tag('description', FEED_DESCRIPTION).trimStart(),
    ...items.map(renderItem),
    '</channel>',
    '</rss>',
    '',
  ].join('\n');
}

/** Convenience wrapper used by the route. */
export function buildFeed(siteUrl: string): string {
  return renderFeed(siteUrl, buildFeedItems(siteUrl));
}

export const FEED_LIMITS = {
  MAX_ID_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_ADDITIONAL_IMAGES,
} as const;
