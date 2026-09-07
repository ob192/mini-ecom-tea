import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
  «Назад» must always have somewhere to go.

  It used to call `router.back()`. On a direct landing — a pasted URL, a link
  opened in a new tab, an ad or a search result pointing straight at a product
  — there is no in-app entry behind the page, so the control walked the visitor
  out of the shop into a blank tab. Reproduced on
  /product/puer/jingmai-qiaomu-shu in a fresh tab. And when there *is* a
  previous entry it is usually Google, which no browser API lets us tell apart
  from one of our own pages, so honouring history would send paid traffic back
  to the auction it was bought from.

  It is now a real link to the page's parent. These tests pin that, and pin the
  parents of the pages where landing cold is most likely (a product) or where
  losing the visitor costs the most (cart, checkout).
*/

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

/*
  Comments in these files discuss `router.back()` at length — that is the point
  of them. Strip comments before asserting on what the code does, or the
  explanation of the bug reads as the bug.
*/
const code = (p: string) =>
  read(p)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

const breadcrumb = code('design/primitives/Breadcrumb.tsx');
const header = code('components/Header.tsx');
const product = code('app/product/[...slug]/page.tsx');

describe('the back affordance', () => {
  it('is a link, not browser history', () => {
    expect(breadcrumb).not.toMatch(/router\.back\(\)/);
    expect(breadcrumb).not.toMatch(/useRouter/);
    expect(breadcrumb).toMatch(/<Link\b/);
  });

  it('always resolves to some href, even if a caller forgets one', () => {
    // The default is a floor, not a good answer — but a wrong destination is
    // recoverable and a dead end is not.
    expect(breadcrumb).toMatch(/href = '\/'/);
  });

  it('is fed by the header rather than being hardcoded', () => {
    expect(header).toMatch(/backHref = '\/'/);
    expect(header).toMatch(/<Breadcrumb href=\{backHref\} \/>/);
  });
});

describe('parents of the pages a visitor is most likely to land on cold', () => {
  it('a product page points back to its own filtered catalogue', () => {
    expect(product).toMatch(/<Header back backHref=\{`\/catalog\?cat=\$\{product\.category\}`\} \/>/);
  });

  it("and that agrees with the page's BreadcrumbList JSON-LD", () => {
    // Google is shown one parent and the visitor another only if these drift.
    expect(product).toMatch(/path: `\/catalog\?cat=\$\{product\.category\}`/);
  });

  it('the cart and the checkout stay inside the funnel', () => {
    expect(read('components/CartView.tsx')).toMatch(/backHref="\/catalog"/);
    expect(read('components/CheckoutForm.tsx')).toMatch(/backHref="\/cart"/);
  });

  it('a journal article points back to the journal', () => {
    expect(read('app/journal/[slug]/page.tsx')).toMatch(/backHref="\/journal"/);
  });
});
