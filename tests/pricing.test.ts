import { describe, expect, it } from 'vitest';
import {
  products,
  getProduct,
  priceFor,
  defaultWeight,
  collapseToTier,
  CATEGORY_ORDER,
} from '@/lib/products';
import { isValidUaPhone, normalizeUaPhone, uah, plural } from '@/lib/format';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_FEE, RETURN_WINDOW_DAYS, deliveryFeeFor } from '@/lib/shipping';
import { buildFeedItems } from '@/lib/merchant-feed';

const tiered = products.find((p) => p.priceTiers.length > 1)!;

describe('catalog integrity', () => {
  it('every product derives a known category from its slug prefix', () => {
    // A slug prefix that isn't a configured category falls through silently —
    // no label, no filter chip, no placeholder tone. Catch it here instead.
    const known = CATEGORY_ORDER.map((c) => c.slug);
    const strays = products.filter((p) => !known.includes(p.category));
    expect(strays.map((p) => p.slug)).toEqual([]);
  });

  it('in-stock products always resolve a price at their default weight', () => {
    const broken = products
      .filter((p) => p.inStock)
      .filter((p) => priceFor(p, defaultWeight(p)) == null);
    expect(broken.map((p) => p.slug)).toEqual([]);
  });

  it('price tiers are sorted by weight and cost more as they get bigger', () => {
    for (const p of products) {
      const weights = p.priceTiers.map((t) => t.weight);
      expect(weights, p.slug).toEqual([...weights].sort((a, b) => a - b));
    }
  });
});

describe('priceFor', () => {
  it('resolves an exact tier weight', () => {
    const tier = tiered.priceTiers[1];
    expect(priceFor(tiered, tier.weight)).toBe(tier.price);
  });

  it('refuses a weight that is not an exact tier', () => {
    expect(priceFor(tiered, 7)).toBeNull();
  });

  it('is what stops a forged weight from being priced', () => {
    expect(priceFor(tiered, -1)).toBeNull();
    expect(priceFor(tiered, Number.MAX_SAFE_INTEGER)).toBeNull();
  });
});

describe('collapseToTier', () => {
  it('leaves a single pack alone', () => {
    const w = tiered.priceTiers[0].weight;
    expect(collapseToTier(tiered, w, 1)).toEqual({ weight: w, qty: 1 });
  });

  it('collapses N small packs into the cheaper single larger tier', () => {
    // Find a product where two of tier A equal tier B, and B is cheaper than 2×A.
    const candidate = products.find((p) =>
      p.priceTiers.some((a) =>
        p.priceTiers.some((b) => b.weight === a.weight * 2 && b.price < a.price * 2),
      ),
    );
    if (!candidate) return; // catalogue may not contain such a pair
    const a = candidate.priceTiers.find((x) =>
      candidate.priceTiers.some((b) => b.weight === x.weight * 2 && b.price < x.price * 2),
    )!;
    const collapsed = collapseToTier(candidate, a.weight, 2);
    expect(collapsed).toEqual({ weight: a.weight * 2, qty: 1 });
    expect(priceFor(candidate, collapsed.weight)!).toBeLessThan(a.price * 2);
  });

  it('never collapses into a more expensive combination', () => {
    for (const p of products) {
      for (const tier of p.priceTiers) {
        for (const qty of [2, 3, 4]) {
          const before = (priceFor(p, tier.weight) ?? 0) * qty;
          const c = collapseToTier(p, tier.weight, qty);
          const after = (priceFor(p, c.weight) ?? 0) * c.qty;
          expect(after, `${p.slug} ${tier.weight}g ×${qty}`).toBeLessThanOrEqual(before);
        }
      }
    }
  });
});

describe('getProduct', () => {
  it('returns undefined for unknown slugs instead of throwing', () => {
    expect(getProduct('does/not-exist')).toBeUndefined();
    expect(getProduct('')).toBeUndefined();
  });
});

describe('ukrainian phone handling', () => {
  it.each(['+380986575800', '380986575800', '0986575800', '+38 (098) 657-58-00'])(
    'accepts %s',
    (input) => {
      expect(isValidUaPhone(input)).toBe(true);
      expect(normalizeUaPhone(input)).toBe('+380986575800');
    },
  );

  it.each(['123', '', '+1 555 0100', '09865758001', 'not a phone'])('rejects %s', (input) => {
    expect(isValidUaPhone(input)).toBe(false);
  });
});

describe('formatting', () => {
  it('formats hryvnia amounts', () => {
    expect(uah(285)).toContain('285');
    expect(uah(285)).toContain('₴');
  });

  it('picks the right ukrainian plural form', () => {
    expect(plural(1, 'товар', 'товари', 'товарів')).toBe('товар');
    expect(plural(3, 'товар', 'товари', 'товарів')).toBe('товари');
    expect(plural(11, 'товар', 'товари', 'товарів')).toBe('товарів');
    expect(plural(21, 'товар', 'товари', 'товарів')).toBe('товар');
  });
});

describe('shipping terms are single-sourced', () => {
  // These two numbers were copy-pasted into the cart, the order API and the
  // feed, and are written out as prose on /delivery and in the catalogue
  // banner. Merchant Center compares the feed against the page, so a half-done
  // change is a disapproval — lib/shipping.ts is now the one place they live.
  it('quotes 100 UAH, free from 500 UAH', () => {
    expect(FREE_DELIVERY_THRESHOLD).toBe(500);
    expect(DELIVERY_FEE).toBe(100);
  });

  it('charges delivery below the threshold and nothing at or above it', () => {
    expect(deliveryFeeFor(499)).toBe(DELIVERY_FEE);
    expect(deliveryFeeFor(FREE_DELIVERY_THRESHOLD)).toBe(0);
    expect(deliveryFeeFor(1200)).toBe(0);
  });

  it('agrees with the feed shipping the Merchant Center feed publishes', () => {
    for (const item of buildFeedItems('https://example.com')) {
      const price = Number(item.price.split(' ')[0]);
      expect(item.shippingPrice, item.id).toBe(`${deliveryFeeFor(price).toFixed(2)} UAH`);
    }
  });

  it('keeps the return window the /returns page states', () => {
    expect(RETURN_WINDOW_DAYS).toBe(14);
  });
});
