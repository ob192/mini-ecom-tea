import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
  Two dead ends on the last screen of the checkout, both found by walking the
  built site rather than by any test, and both pinned here.

  1. **The button that did nothing.** `lib/checkout-schema.ts` has always
     required a city, and a warehouse when the delivery is to a branch — so
     `handleSubmit` refused to submit without them. But nothing on the page
     rendered those two messages: `ShippingSelector`'s city and warehouse are
     hand-built trigger buttons, not `Field`s, so no `FormMessage` reached them.
     A customer who filled in name and phone, missed the city picker and pressed
     «Підтвердити замовлення» got a toast telling them to check the highlighted
     fields — while nothing at all was highlighted. The order ended there.

  2. **«Місто не знайдено» for a 502.** Both pickers read `data.items ?? []`
     straight off the response, so any failure — Nova Poshta down, a dropped
     connection, our own 60/min limiter — told the customer their city does not
     exist, and then cached that empty answer under the query, so retyping the
     same letters repeated it for the rest of the visit.

  These are source-text contracts: the fix is spread across two files that
  nothing else links, so either half can be removed without the other looking
  wrong.
*/

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const selector = read('components/ShippingSelector.tsx');
const form = read('components/CheckoutForm.tsx');
const schema = read('lib/checkout-schema.ts');

describe('the shipping fields report their own errors', () => {
  it('the schema still requires a city and a warehouse', () => {
    expect(schema).toMatch(/cityRef:\s*z\.string\(\)[^\n]*min\(1/);
    expect(schema).toMatch(/path:\s*\['warehouseRef'\]/);
  });

  it('ShippingSelector takes both messages', () => {
    expect(selector).toMatch(/cityError\?:\s*string/);
    expect(selector).toMatch(/warehouseError\?:\s*string/);
  });

  it('and renders each one as an alert', () => {
    expect(selector).toMatch(/\{cityError \?[\s\S]{0,200}role="alert"/);
    expect(selector).toMatch(/\{warehouseError \?[\s\S]{0,200}role="alert"/);
  });

  it('and marks the trigger so the toast has something to point at', () => {
    /*
      `data-invalid`, not `aria-invalid`: the triggers are plain buttons, where
      `aria-invalid` is undefined and ignored. The message reaches assistive
      technology through `aria-describedby` + `role=alert` instead.
    */
    expect(selector).toMatch(/data-invalid=\{cityError \? '' : undefined\}/);
    expect(selector).toMatch(/data-invalid=\{warehouseError \? '' : undefined\}/);
    expect(selector).toMatch(/data-\[invalid\]:border-error/);
    expect(selector).toMatch(/aria-describedby=\{cityError \? cityErrId : undefined\}/);
    expect(selector).toMatch(/aria-describedby=\{warehouseError \? whErrId : undefined\}/);
  });

  it('the form hands it the errors it holds', () => {
    expect(form).toMatch(/cityError=\{form\.formState\.errors\.cityRef\?\.message\}/);
    expect(form).toMatch(/warehouseError=\{form\.formState\.errors\.warehouseRef\?\.message\}/);
  });

  it('a failed submit scrolls to a message react-hook-form cannot focus', () => {
    // RHF focuses the first invalid field it holds a ref for; these two are
    // `setValue`-driven buttons, so it has none and never moves to them.
    expect(form).toMatch(/cityRef', 'warehouseRef'/);
    expect(form).toMatch(/scrollIntoView/);
    /*
      A macrotask, not an animation frame: a backgrounded tab never fires one,
      and this runs on a submit the customer may have tabbed away from. Matched
      on the code rather than on the file, so the comment explaining the choice
      does not satisfy its own test.
    */
    const scroll = form.match(/setTimeout\(\(\) => \{[\s\S]*?scrollIntoView[\s\S]*?\}, 0\)/);
    expect(scroll).not.toBeNull();
    // Aimed at the message's own id, which ShippingSelector must still emit.
    expect(form).toMatch(/getElementById\('np-city-error'\)/);
    expect(form).toMatch(/getElementById\('np-warehouse-error'\)/);
    expect(selector).toMatch(/cityErrId = 'np-city-error'/);
    expect(selector).toMatch(/whErrId = 'np-warehouse-error'/);
    expect(form).toMatch(/prefers-reduced-motion: reduce/);
  });
});

describe('a failed Nova Poshta lookup is not an empty one', () => {
  it('the lookup rejects a failed response instead of reading items off it', () => {
    expect(selector).toMatch(/async function npLookup/);
    expect(selector).toMatch(/if \(!r\.ok \|\| data\?\.error \|\| !Array\.isArray\(data\?\.items\)\) throw/);
  });

  it('neither picker reads `data.items` off an unchecked response any more', () => {
    expect(selector).not.toMatch(/\.then\(\(r\) => r\.json\(\)\)/);
    expect(selector).not.toMatch(/data\?\.items \?\? \[\]/);
  });

  it('both pickers go through it', () => {
    expect(selector).toMatch(/npLookup<CityOpt>\('\/api\/np\/cities'/);
    expect(selector).toMatch(/npLookup<WhOpt>\('\/api\/np\/warehouses'/);
  });

  it('a failure is never written to the session cache', () => {
    // Both caches are only ever set inside the success branch.
    for (const cache of ['cityCache.set', 'warehouseCache.set']) {
      const idx = selector.indexOf(cache);
      expect(idx).toBeGreaterThan(-1);
      const before = selector.slice(Math.max(0, idx - 200), idx);
      expect(before).toMatch(/\.then\(\(items\) => \{/);
    }
  });

  it('the dialog says what happened and offers a retry', () => {
    expect(selector).toMatch(/Не вдалося звʼязатися з Новою поштою/);
    expect(selector).toMatch(/Спробувати ще раз/);
    expect(selector).toMatch(/onRetry/);
    expect(selector).toMatch(/setAttempt\(\(n\) => n \+ 1\)/);
  });

  it('the retry actually re-runs the lookup', () => {
    // `attempt` has to be in the effect deps or the button does nothing.
    expect(selector).toMatch(/\}, \[debounced, attempt\]\)/);
    expect(selector).toMatch(/\}, \[open, cityRef, debounced, attempt\]\)/);
  });
});
