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
const chip = code('components/ui/weight-chip.tsx');

describe('the catalogue card tier selector', () => {
  it('uses the shared chip control rather than drawing its own', () => {
    expect(card).toMatch(/import \{ WeightChip \} from '@\/components\/ui\/weight-chip'/);
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

/*
  Cards in a row end on one line.

  The card is a flex column: the middle section is `flex-1` and the price sits
  on `mt-auto`, which is only able to push anything down if the card itself
  fills its cell. It did not. In `ProductRail` the flex scroller stretches the
  wrapper to the tallest card in the row while the `<article>` inside keeps its
  content height — measured at 1440 on the home rail: wrappers all 442px,
  articles 442 / 414 / 414 / 410 / 414, prices on three different lines. A card
  whose chip row wrapped onto a second line simply grew.

  `h-full` is the whole fix, and it fixes the rail and the catalogue grid
  together, so it is asserted on the card rather than on either container.
*/
describe('cards fill their cell', () => {
  it('the article is h-full', () => {
    expect(card).toMatch(/<article className="flex h-full flex-col/);
  });

  it('and still distributes the slack the way the layout expects', () => {
    // Without all three of these, h-full alone changes nothing visible.
    expect(card).toMatch(/className="flex flex-1 flex-col/);
    expect(card).toMatch(/className="mt-auto flex flex-wrap items-baseline/);
  });
});

/*
  The add button's accessible name must not invent a weight.

  `defaultWeight` ends in `product.weight ?? 0`, so every product without
  tiers and without a weight — all the teaware, the figurines and both sets,
  27 of 44 — resolved to 0, and the button announced «Додати Гайвань бамбук
  150 мл, 0 г, в кошик». The visible price line beside it had always guarded
  the same value with `{weight ? … : null}`; only the label went unguarded,
  so nothing on screen ever showed the fault.
*/
describe('the add button says what it will add', () => {
  it('names a weight only when there is one', () => {
    expect(card).toMatch(/: weight\s*\n?\s*\? `Додати \$\{product\.title\}, \$\{weight\} \$\{UNIT\}, в кошик`/);
    expect(card).toMatch(/: `Додати \$\{product\.title\} в кошик`/);
  });

  it('never interpolates the weight unconditionally', () => {
    // The shape this replaced. Any label that reaches `${weight}` without a
    // truthiness check in front of it is the bug coming back.
    expect(card).not.toMatch(
      /product\.inStock\s*\n?\s*\? `Додати \$\{product\.title\}, \$\{weight\}/,
    );
  });

  it('still says so when the product is gone', () => {
    expect(card).toMatch(/`\$\{product\.title\} — немає в наявності`/);
  });

  it('and the catalogue really does hold products with no weight', () => {
    // If this ever becomes empty the guard above is dead code, and the test
    // above it is pinning a branch nothing takes.
    const weightless = products.filter(
      (p) => p.inStock && p.priceTiers.length === 0 && defaultWeight(p) === 0,
    );
    expect(weightless.length, 'no weightless product left to guard').toBeGreaterThan(0);
  });
});
