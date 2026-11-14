import { beforeEach, describe, expect, it } from 'vitest';
import { readGaCookies } from '@/lib/ga4-server';
import { toGaItem, cartToGaItems, cartValue, trackAddToCart, trackViewCart } from '@/lib/analytics';
import { products, priceFor } from '@/lib/products';

const tiered = products.find((p) => p.priceTiers.length > 1)!;
const weight = tiered.priceTiers[0].weight;
const price = priceFor(tiered, weight)!;

describe('readGaCookies', () => {
  it('parses the modern GA4 session cookie (GS2 / $-delimited)', () => {
    const ids = readGaCookies(
      '_ga=GA1.1.883271238.1785512078; _ga_5PCX5S995S=GS2.1.s1785512077$o1$g0$t1785512077$j60',
      'G-5PCX5S995S',
    );
    expect(ids).toEqual({ clientId: '883271238.1785512078', sessionId: '1785512077' });
  });

  it('parses the legacy GA4 session cookie (GS1 / dot-delimited)', () => {
    const ids = readGaCookies(
      '_ga=GA1.1.1234567890.1700000000; _ga_5PCX5S995S=GS1.1.1700000123.4.1.1700000456.0.0.0',
      'G-5PCX5S995S',
    );
    expect(ids).toEqual({ clientId: '1234567890.1700000000', sessionId: '1700000123' });
  });

  it('returns the client id even when the session cookie belongs to another stream', () => {
    const ids = readGaCookies(
      '_ga=GA1.1.883271238.1785512078; _ga_DIFFERENT=GS2.1.s1$o1',
      'G-5PCX5S995S',
    );
    expect(ids.clientId).toBe('883271238.1785512078');
    expect(ids.sessionId).toBeNull();
  });

  it.each([
    ['no cookie header', null],
    ['empty header', ''],
    ['unrelated cookies', 'session=abc; theme=dark'],
    ['malformed _ga', '_ga=garbage'],
  ])('degrades safely: %s', (_label, header) => {
    const ids = readGaCookies(header, 'G-5PCX5S995S');
    expect(ids.clientId).toBeNull();
    expect(ids.sessionId).toBeNull();
  });
});

describe('GA4 item mapping', () => {
  it('maps a product and its chosen tier', () => {
    const gaItem = toGaItem(tiered, weight, 2);
    expect(gaItem.item_id).toBe(tiered.slug);
    expect(gaItem.item_name).toBe(tiered.title);
    expect(gaItem.item_variant).toContain(String(weight));
    expect(gaItem.price).toBe(price);
    expect(gaItem.quantity).toBe(2);
  });

  it('omits item_variant for weightless items', () => {
    expect(toGaItem(tiered, 0).item_variant).toBeUndefined();
  });

  it('drops cart lines whose product no longer exists', () => {
    const items = cartToGaItems([
      { slug: tiered.slug, weight, qty: 1 },
      { slug: 'deleted/product', weight: 25, qty: 3 },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].item_id).toBe(tiered.slug);
  });

  it('values a cart from the catalogue, not from the caller', () => {
    expect(cartValue([{ slug: tiered.slug, weight, qty: 3 }])).toBe(price * 3);
    expect(cartValue([{ slug: 'deleted/product', weight: 25, qty: 3 }])).toBe(0);
  });
});

describe('dataLayer pushes', () => {
  beforeEach(() => {
    (globalThis as any).window = { dataLayer: [] };
  });

  const dl = () => (globalThis as any).window.dataLayer as Record<string, unknown>[];

  it('resets ecommerce before every ecommerce event', () => {
    // Without the null reset GTM merges the previous event's items into this one.
    trackAddToCart(tiered, weight, 1);
    expect(dl()[0]).toEqual({ ecommerce: null });
    expect(dl()[1].event).toBe('add_to_cart');
  });

  it('sends currency and a value that matches the items', () => {
    trackAddToCart(tiered, weight, 2);
    const ecommerce = dl()[1].ecommerce as any;
    expect(ecommerce.currency).toBe('UAH');
    expect(ecommerce.value).toBe(price * 2);
    expect(ecommerce.items[0].quantity).toBe(2);
  });

  it('resets again on a second event so items never leak between them', () => {
    trackAddToCart(tiered, weight, 1);
    trackViewCart([{ slug: tiered.slug, weight, qty: 1 }]);
    expect(dl().filter((e) => e.ecommerce === null)).toHaveLength(2);
    expect(dl().map((e) => e.event).filter(Boolean)).toEqual(['add_to_cart', 'view_cart']);
  });
});
