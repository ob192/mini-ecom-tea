import { describe, expect, it } from 'vitest';
import {
  buildFeed,
  buildFeedItems,
  feedDefects,
  feedExclusionFor,
  googleCategoryFor,
  offerId,
  feedKey,
  productTypeFor,
  ADVERTISED_CATEGORIES,
  FEED_LIMITS,
  GOOGLE_CATEGORY,
} from '@/lib/merchant-feed';
import { products, priceFor } from '@/lib/products';

const SITE = 'https://jintea.example';
const items = buildFeedItems(SITE);
const xml = buildFeed(SITE);

/** Products that should be listed — everything not explicitly excluded. */
const listed = products.filter((p) => feedExclusionFor(p) === null);

/**
 * The product an offer came from. Ids no longer contain the slug verbatim
 * (a raw "/" in an id is what validators flag), so resolve through the same
 * feedKey() the feed builds them with rather than parsing the id back apart.
 * `item_group_id` is the key for tiered products; a single-price product's id
 * is the key itself.
 */
const byKey = new Map(products.map((p) => [feedKey(p.slug), p]));
const productFor = (item: { id: string; itemGroupId?: string }) =>
  byKey.get(item.itemGroupId ?? item.id)!;

describe('feed coverage', () => {
  it('emits one offer per weight tier, and one per single-price product', () => {
    const expected = listed.reduce((n, p) => n + Math.max(1, p.priceTiers.length), 0);
    expect(items).toHaveLength(expected);
  });

  it('advertises tea only — teaware and sets are deliberately left out', () => {
    for (const product of products) {
      const advertised = feedExclusionFor(product) === null;
      expect(advertised && !ADVERTISED_CATEGORIES.has(product.category), product.slug).toBe(false);
    }
    // Nothing outside the tea categories reaches the feed.
    expect(items.every((i) => ADVERTISED_CATEGORIES.has(productFor(i).category))).toBe(true);
    // ...and every tea category is actually represented, so a typo in the set
    // silently dropping a whole category fails here.
    const inFeed = new Set(items.map((i) => productFor(i).category));
    expect([...ADVERTISED_CATEGORIES].every((c) => inFeed.has(c))).toBe(true);
  });

  it('excludes only products Merchant Center would reject outright', () => {
    // image_link is required, so a photo-less product cannot be submitted.
    // If this list grows, an advertised product silently stopped being listed.
    // The photo-less figurine no longer appears: figurines are not advertised.
    expect(feedDefects()).toEqual([]);
  });

  it('quotes the same price the storefront resolves for that weight', () => {
    for (const item of items) {
      const product = productFor(item);
      const weight = item.size ? Number.parseInt(item.size, 10) : null;
      const expected = weight != null ? priceFor(product, weight) : product.price;
      expect(item.price, item.id).toBe(`${expected!.toFixed(2)} UAH`);
    }
  });
});

describe('required attributes', () => {
  it('sets every attribute GMC requires, non-empty', () => {
    for (const item of items) {
      expect(item.id, 'id').toBeTruthy();
      expect(item.title, item.id).toBeTruthy();
      expect(item.description, item.id).toBeTruthy();
      expect(item.link, item.id).toBe(`${SITE}/product/${productFor(item).slug}`);
      expect(item.imageLink, item.id).toMatch(/^https:\/\/.+\.(jpg|jpeg|png|webp|avif)$/i);
      expect(item.availability, item.id).toBe('in_stock');
      expect(item.price, item.id).toMatch(/^\d+\.\d{2} UAH$/);
      expect(item.condition, item.id).toBe('new');
      expect(item.brand, item.id).toBe('Jintea');
    }
  });

  // Merchant Center once carried the bare host here. A URL where a brand
  // belongs means a search for "Jintea" cannot match the offers, and the
  // Knowledge Graph has no name to bind the shop to — so brand must never
  // drift back into looking like a domain.
  it('advertises a brand name, not a hostname', () => {
    for (const item of items) {
      expect(item.brand, item.id).not.toMatch(/\.[a-z]{2,}(\/|$)/i);
    }
  });

  it('declares Ukrainian as the feed content language', () => {
    expect(xml).toContain('<language>uk</language>');
  });

  // title/link/description are RSS 2.0's OWN predefined item elements. The g:
  // namespace is for the attributes Google adds on top of RSS, so prefixing
  // these three makes a validator read all of them as missing — the item then
  // has no name, no landing page and no copy.
  it('writes the RSS predefined elements without the g: prefix', () => {
    for (const el of ['title', 'link', 'description']) {
      expect(xml, el).not.toContain(`<g:${el}>`);
      expect(xml.match(new RegExp(`<${el}>`, 'g'))!.length, el).toBe(items.length + 1); // +1 = channel
    }
  });

  // A raw "/" in an id reads as a path separator wherever the id is echoed
  // into a URL or a report, and validators flag it as malformed.
  it('keeps path separators out of ids and item_group_ids', () => {
    for (const item of items) {
      expect(item.id, item.id).not.toContain('/');
      if (item.itemGroupId) expect(item.itemGroupId, item.id).not.toContain('/');
    }
  });

  // Google's accepted values are in_stock / out_of_stock / preorder /
  // backorder — underscored, and with no stray whitespace to be trimmed.
  it('uses Google\'s exact availability token', () => {
    for (const item of items) {
      expect(item.availability, item.id).toBe('in_stock');
      expect(item.availability.trim(), item.id).toBe(item.availability);
    }
    expect(xml).not.toMatch(/<g:availability>\s|\s<\/g:availability>/);
  });

  // Leaf tea has no GS1 barcode, so there is no GTIN to publish and none may
  // be invented. It does have an MPN: Jintea is the brand owner and sole
  // seller of tea with no official brand, which is the private-label case
  // where Google has the merchant assign the part number. Supplying brand +
  // MPN is what replaces identifier_exists — submitting both together is the
  // contradiction Merchant Center warns about.
  it('publishes a merchant-assigned MPN instead of identifier_exists', () => {
    for (const item of items) {
      expect(item.mpn, item.id).toBe(item.id);
    }
    expect(xml).toContain('<g:mpn>');
    expect(xml).not.toContain('<g:identifier_exists>');
    // No GS1 barcode exists for loose leaf tea, and a fabricated one is a
    // disapproval rather than a fix.
    expect(xml).not.toContain('<g:gtin>');
  });

  it('keeps ids unique and within the 50-character limit', () => {
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id.length, id).toBeLessThanOrEqual(FEED_LIMITS.MAX_ID_LENGTH);
  });

  it('keeps titles and descriptions within GMC length limits', () => {
    for (const item of items) {
      expect(item.title.length, item.id).toBeLessThanOrEqual(FEED_LIMITS.MAX_TITLE_LENGTH);
      expect(item.description.length, item.id).toBeLessThanOrEqual(
        FEED_LIMITS.MAX_DESCRIPTION_LENGTH,
      );
      // Descriptions are stored newline-separated; GMC wants one flat string.
      expect(item.description, item.id).not.toContain('\n');
    }
  });

  it('caps additional images at 10 and never repeats the main image', () => {
    for (const item of items) {
      expect(item.additionalImageLinks.length, item.id).toBeLessThanOrEqual(
        FEED_LIMITS.MAX_ADDITIONAL_IMAGES,
      );
      expect(item.additionalImageLinks, item.id).not.toContain(item.imageLink);
    }
  });

  it('uses absolute URLs everywhere — relative paths are rejected on fetch', () => {
    const urls = items.flatMap((i) => [i.link, i.imageLink, ...i.additionalImageLinks]);
    for (const url of urls) expect(url.startsWith(`${SITE}/`), url).toBe(true);
  });
});

describe('variants', () => {
  const tiered = products.filter((p) => p.priceTiers.length > 1 && feedExclusionFor(p) === null);

  it('groups every tier of a product under one item_group_id', () => {
    for (const product of tiered) {
      const group = items.filter((i) => i.itemGroupId === feedKey(product.slug));
      expect(group.map((i) => i.id), product.slug).toEqual(
        product.priceTiers.map((t) => offerId(product, t.weight)),
      );
      // `size` is the differentiating attribute; duplicates collapse in Shopping.
      expect(new Set(group.map((i) => i.size)).size, product.slug).toBe(group.length);
    }
  });

  it('leaves single-price products ungrouped and unsized', () => {
    const single = items.filter((i) => !i.itemGroupId);
    expect(single.every((i) => i.size === undefined)).toBe(true);
    expect(single.length).toBe(listed.length - tiered.length);
  });

  it('puts the weight in the variant title so the tiers are distinguishable', () => {
    for (const item of items.filter((i) => i.size)) {
      expect(item.title, item.id).toContain(item.size!);
    }
  });

  it('prices per 100 g using GMC unit codes', () => {
    for (const item of items.filter((i) => i.unitPricingMeasure)) {
      expect(item.unitPricingMeasure, item.id).toMatch(/^\d+ g$/);
      expect(item.unitPricingBaseMeasure, item.id).toBe('100 g');
    }
    // Every listed offer is tea sold by weight, so all of them carry one.
    expect(items.every((i) => i.unitPricingMeasure)).toBe(true);
  });
});

describe('categories and shipping', () => {
  it('maps every category to a Google taxonomy id', () => {
    for (const item of items) expect(Number.isInteger(item.googleProductCategory)).toBe(true);
    for (const id of Object.values(GOOGLE_CATEGORY)) expect(id).toBeGreaterThan(0);
  });

  it('overrides the category where the slug prefix misclassifies the product', () => {
    // A tea assortment sold as a "set", and a serving pitcher filed under accessories.
    expect(googleCategoryFor(products.find((p) => p.slug === 'set/start-mini-7')!)).toBe(2073);
    expect(googleCategoryFor(products.find((p) => p.slug === 'set/travel-mountains-3in1')!)).toBe(
      6740,
    );
    expect(
      googleCategoryFor(products.find((p) => p.slug === 'accessory/chahai-glass-285ml')!),
    ).toBe(3330);
  });

  it('builds a two-level product_type from the category label', () => {
    expect(productTypeFor(products.find((p) => p.category === 'puer')!)).toBe('Чай > Пуер');
    expect(productTypeFor(products.find((p) => p.category === 'set')!)).toBe('Набори');
  });

  it('charges delivery only below the free-delivery threshold', () => {
    for (const item of items) {
      const price = Number.parseFloat(item.price);
      expect(item.shippingPrice, item.id).toBe(price >= 500 ? '0.00 UAH' : '100.00 UAH');
    }
  });
});

describe('XML document', () => {
  it('is a well-formed RSS 2.0 feed in the g: namespace', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n')).toBe(true);
    expect(xml).toContain('<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">');
    expect(xml.trimEnd().endsWith('</rss>')).toBe(true);
    expect((xml.match(/<item>/g) ?? []).length).toBe(items.length);
    expect((xml.match(/<item>/g) ?? []).length).toBe((xml.match(/<\/item>/g) ?? []).length);
  });

  it('escapes markup-significant characters instead of emitting raw XML', () => {
    const escaped = buildFeed(SITE).replace(/<[^>]+>/g, '');
    expect(escaped).not.toMatch(/[<>]/);
    // The catalogue copy uses « » and — freely; those are valid UTF-8, not entities.
    expect(xml).toContain('«');
  });

  it('renders one shipping block per item', () => {
    expect((xml.match(/<g:shipping>/g) ?? []).length).toBe(items.length);
    expect((xml.match(/<g:country>UA<\/g:country>/g) ?? []).length).toBe(items.length);
  });
});
