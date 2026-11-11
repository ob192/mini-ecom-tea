/*
  catalogue.mjs — the ad's single source of truth for every number and name
  that appears on screen.

  A published ad that claims a price the cart does not charge is a worse
  failure than an ad that does not render, so nothing here is hardcoded and
  nothing here is forgiving: every lookup either finds the real value in the
  repository or throws. `public/products.json` is the catalogue the storefront
  itself reads, and `lib/shipping.ts` holds the free-delivery threshold the
  order API enforces, so both are read from disk at render time.

  The seven tea names come out of the set's own `description`. That field is
  newline-separated (see CLAUDE.md), with the contents listed as `• ` bullets
  under a "Що всередині:" heading and tasting notes under a later heading —
  so the parse stops at the first non-bullet line after the heading rather
  than sweeping up the tasting notes too.
*/

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
/** tools/hyperframes -> repository root. */
export const REPO = resolve(HERE, '..', '..');

/** The set this creative advertises. */
const SET_SLUG = 'set/start-mini-7';
const CONTENTS_HEADING = 'Що всередині:';

function fail(message) {
  throw new Error(
    `catalogue: ${message}\n` +
      `The ad was not rendered. Fix the catalogue or this reader — do not ` +
      `hardcode the value, or the creative can outlive the price it quotes.`,
  );
}

/** The raw product entry for the advertised set. */
export function readSet() {
  const path = resolve(REPO, 'public/products.json');
  const products = JSON.parse(readFileSync(path, 'utf8'));
  const set = products.find((p) => p.slug === SET_SLUG);
  if (!set) fail(`no product with slug "${SET_SLUG}" in ${path}`);
  if (typeof set.price !== 'number' || !Number.isFinite(set.price) || set.price <= 0) {
    fail(`"${SET_SLUG}" has no usable price (got ${JSON.stringify(set.price)})`);
  }
  return set;
}

/** The seven Ukrainian tea names, in the order the catalogue lists them. */
export function readTeaNames(set) {
  const lines = String(set.description || '').split('\n');
  const start = lines.findIndex((l) => l.trim() === CONTENTS_HEADING);
  if (start === -1) fail(`"${CONTENTS_HEADING}" is missing from the set's description`);

  const names = [];
  for (const line of lines.slice(start + 1)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('•')) break; // the next heading ends the list
    names.push(trimmed.replace(/^•\s*/, ''));
  }
  if (names.length === 0) fail('the contents list is empty');
  return names;
}

/** Free-delivery threshold, read from the constant the order API enforces. */
export function readFreeDeliveryThreshold() {
  const path = resolve(REPO, 'lib/shipping.ts');
  const source = readFileSync(path, 'utf8');
  const match = source.match(/export const FREE_DELIVERY_THRESHOLD\s*=\s*(\d+)/);
  if (!match) fail(`FREE_DELIVERY_THRESHOLD not found in ${path}`);
  return Number(match[1]);
}

/** The wordmark, read from the constant every page title already uses. */
export function readBrandName() {
  const path = resolve(REPO, 'lib/contacts.ts');
  const source = readFileSync(path, 'utf8');
  const match = source.match(/export const BRAND_NAME\s*=\s*['"]([^'"]+)['"]/);
  if (!match) fail(`BRAND_NAME not found in ${path}`);
  if (match[1].includes('.')) {
    fail(`BRAND_NAME is "${match[1]}", which looks like a domain, not a wordmark`);
  }
  return match[1];
}

/**
 * Grams per sachet and grams in total.
 *
 * Both are stated in the set's own copy ("Сім сортів по 10 г, разом 70 г"),
 * and the product of the two is checked against the number of teas: if the
 * copy and the contents list ever disagree, that is exactly the silent
 * mismatch this reader exists to catch.
 */
export function readWeights(set, teaCount) {
  const text = `${set.title}\n${set.description}`;
  const per = text.match(/по\s+(\d+)\s*г/);
  if (!per) fail('grams per sachet ("по N г") not found in the set copy');
  const perGrams = Number(per[1]);

  const total = text.match(/разом\s+(\d+)\s*г/);
  const totalGrams = total ? Number(total[1]) : perGrams * teaCount;

  if (perGrams * teaCount !== totalGrams) {
    fail(
      `the copy says ${perGrams} г x ${teaCount} teas but totals ${totalGrams} г — ` +
        `the catalogue contradicts itself, so neither number can be advertised`,
    );
  }
  return { perGrams, totalGrams };
}

/** Everything the composition needs, resolved and cross-checked. */
export function buildVariables() {
  const set = readSet();
  const teas = readTeaNames(set);
  const { perGrams, totalGrams } = readWeights(set, teas.length);

  return {
    brand: readBrandName(),
    teas,
    count: teas.length,
    price: set.price,
    perGrams,
    totalGrams,
    freeDeliveryFrom: readFreeDeliveryThreshold(),
    // Kept out of the on-screen copy on purpose: CLAUDE.md keeps domains in
    // NEXT_PUBLIC_SITE_URL, and a Meta ad carries its destination as a link
    // on the ad object, not burned into the frame.
    setTitle: set.title,
  };
}
