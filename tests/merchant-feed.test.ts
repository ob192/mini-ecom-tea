import { describe, expect, it } from 'vitest';
import {
  buildFeed,
  buildFeedItems,
  feedExclusionFor,
  feedExclusions,
  googleCategoryFor,
  offerId,
  productTypeFor,
  FEED_LIMITS,
  GOOGLE_CATEGORY,
} from '@/lib/merchant-feed';
import { products, priceFor } from '@/lib/products';

const SITE = 'https://jintea.example';
const items = buildFeedItems(SITE);
const xml = buildFeed(SITE);

/** Products that should be listed — everything not explicitly excluded. */
const listed = products.filter((p) => feedExclusionFor(p) === null);

describe('feed coverage', () => {
  it('emits one offer per weight tier, and one per single-price product', () => {
    const expected = listed.reduce((n, p) => n + Math.max(1, p.priceTiers.length), 0);
    expect(items).toHaveLength(expected);
  });

  it('excludes only products Merchant Center would reject outright', () => {
    // image_link is required, so a photo-less product cannot be submitted.
    // If this list grows, a product silently stopped being advertised.
    expect(feedExclusions()).toEqual([{ slug: 'figurine/tiger-yixing', reason: 'no image' }]);
  });

  it('quotes the same price the storefront resolves for that weight', () => {
    for (const item of items) {
      const product = listed.find((p) => item.id.startsWith(p.slug))!;
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
      expect(item.link, item.id).toBe(`${SITE}/product/${item.id.replace(/-\d+g$/, '')}`);
      expect(item.imageLink, item.id).toMatch(/^https:\/\/.+\.(jpg|jpeg|png|webp|avif)$/i);
      expect(item.availability, item.id).toBe('in_stock');
      expect(item.price, item.id).toMatch(/^\d+\.\d{2} UAH$/);
      expect(item.condition, item.id).toBe('new');
      expect(item.brand, item.id).toBe('jintea.shop');
    }
  });

  it('declares identifier_exists=no — the catalogue has no GTIN or MPN', () => {
    expect(items.every((i) => i.identifierExists === false)).toBe(true);
    expect(xml).not.toContain('<g:gtin>');
    expect(xml).not.toContain('<g:mpn>');
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
      const group = items.filter((i) => i.itemGroupId === product.slug);
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
    // Teaware has no weight, so it must not claim a unit price.
    const teaware = items.find((i) => i.id.startsWith('gaiwan/'))!;
    expect(teaware.unitPricingMeasure).toBeUndefined();
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
      expect(item.shippingPrice, item.id).toBe(price >= 500 ? '0.00 UAH' : '60.00 UAH');
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
