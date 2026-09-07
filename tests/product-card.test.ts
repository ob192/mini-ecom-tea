import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { products } from '@/lib/products';
import { defaultWeight, priceFor } from '@/lib/products';

/*
  A catalogue card must not imply three different weights at once.

  It used to. The chips were <li> labels styled exactly like the real
  WeightChips with one of them highlighted, so they read as a selector and
  answered nothing when pressed. Meanwhile the highlight marked the default
  50 г, the price above it read «від 310 ₴» — the 25 г tier — and the add
  button put the 50 г pack in the basket. Whichever of the three a visitor
  believed, one of the others was going to surprise them.

  Comments in these files quote the old copy, so strip them before asserting.
*/
const code = (p: string) =>
  readFileSync(join(process.cwd(), p), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

const card = code('components/ProductCard.tsx');
const chip = code('design/primitives/WeightChip.tsx');

describe('the catalogue card tier selector', () => {
  it('uses the shared chip control rather than drawing its own', () => {
    expect(card).toMatch(/import \{ WeightChip \} from '@\/design'/);
    expect(card).toMatch(/<WeightChip\b/);
  });

  it('offers a compact chip for card scale', () => {
    expect(chip).toMatch(/compact/);
  });

  it('adds the weight the visitor chose, not a fixed default', () => {
    expect(card).toMatch(/add\(product\.slug, weight, 1\)/);
    expect(card).toMatch(/trackAddToCart\(product, weight, 1\)/);
  });

  it('prices the chosen tier instead of the cheapest one', () => {
    expect(card).toMatch(/priceFor\(product, weight\)/);
    // «від» promises a price the add button will not honour.
    expect(card).not.toMatch(/від /);
  });
});

describe('what the card can show', () => {
  it('every tier a card offers resolves to a price', () => {
    // The card prices whatever chip is selected, so an unresolvable tier would
    // render "Ціна за запитом" on a product that is plainly for sale.
    for (const product of products) {
      for (const tier of product.priceTiers) {
        expect(priceFor(product, tier.weight), `${product.slug} @ ${tier.weight}`).toBe(tier.price);
      }
    }
  });

  it('the tier a card opens on is one of the tiers it draws', () => {
    for (const product of products) {
      if (product.priceTiers.length === 0) continue;
      const opening = defaultWeight(product);
      expect(
        product.priceTiers.some((t) => t.weight === opening),
        `${product.slug} opens on ${opening}, which it does not offer`,
      ).toBe(true);
    }
  });

  it('opens on the cheapest tier, so the headline price is the lowest one', () => {
    // The card shows the selected tier's exact price, with no «від» to soften
    // it. Opening anywhere but the cheapest tier would quietly raise every
    // price in the grid.
    for (const product of products) {
      if (product.priceTiers.length === 0) continue;
      const opening = priceFor(product, defaultWeight(product));
      const cheapest = Math.min(...product.priceTiers.map((t) => t.price));
      expect(opening, `${product.slug} does not open on its cheapest tier`).toBe(cheapest);
    }
  });
});
