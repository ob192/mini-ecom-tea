import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/order/route';
import { products, priceFor } from '@/lib/products';

/*
  Integration tests for the order endpoint — the only path that turns a visitor
  into revenue. Two production incidents live in here as regression tests:
  the honeypot silently discarding real orders, and a rejection helper that
  recursed and returned 500 instead of a validation error.
*/

const item = products.find((p) => p.priceTiers.length > 0)!;
const itemWeight = item.priceTiers[0].weight;
const itemPrice = priceFor(item, itemWeight)!;

const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 100;

/** A submission that should always be accepted. */
function validOrder(overrides: Record<string, unknown> = {}) {
  return {
    first: 'Олена',
    last: 'Коваленко',
    phone: '+380986575800',
    deliveryMethod: 'np_warehouse',
    cityName: 'Київ',
    cityRef: 'city-ref',
    warehouse: 'Відділення №1',
    warehouseRef: 'wh-ref',
    address: '',
    items: [{ slug: item.slug, weight: itemWeight, qty: 1 }],
    ...overrides,
  };
}

let ip = 0;
/** Each request gets its own IP so the 5/min rate limiter never interferes. */
function post(body: unknown, headers: Record<string, string> = {}) {
  ip += 1;
  return POST(
    new Request('http://localhost/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `10.0.0.${ip}`, ...headers },
      body: JSON.stringify(body),
    }),
  );
}

/** Telegram + GA4 calls captured instead of sent. */
let sent: { url: string; body: any }[] = [];

beforeEach(() => {
  process.env.TELEGRAM_BOT_TOKEN = 'test-token';
  process.env.TELEGRAM_CHAT_ID = '-100123';
  process.env.GA4_MEASUREMENT_ID = 'G-TEST';
  process.env.GA4_API_SECRET = 'secret';
  sent = [];

  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    sent.push({ url: String(url), body: init?.body ? JSON.parse(String(init.body)) : null });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const telegram = () => sent.find((s) => s.url.includes('api.telegram.org'));

describe('happy path', () => {
  it('accepts a valid order and sends it to Telegram', async () => {
    const res = await post(validOrder());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.orderId).toMatch(/^TC-\d{6}$/);

    const tg = telegram();
    expect(tg).toBeDefined();
    expect(tg!.body.chat_id).toBe('-100123');
    expect(tg!.body.text).toContain(json.orderId);
    expect(tg!.body.text).toContain('Олена');
    expect(tg!.body.text).toContain('+380986575800');
    expect(tg!.body.text).toContain('Київ');
    expect(tg!.body.text).toContain(item.title);
  });

  it('sends the GA4 purchase with the recomputed total', async () => {
    const res = await post(validOrder());
    const { orderId, total } = await res.json();

    const mp = sent.find((s) => s.url.includes('google-analytics.com'));
    expect(mp).toBeDefined();
    const purchase = mp!.body.events[0];
    expect(purchase.name).toBe('purchase');
    expect(purchase.params.transaction_id).toBe(orderId);
    expect(purchase.params.value).toBe(total);
    expect(purchase.params.currency).toBe('UAH');
  });
});

describe('honeypot — must never silently discard an order', () => {
  // Regression: the trap was named "company", browsers autofilled it from the
  // saved address profile, and real orders vanished with a fake TC-000000.
  it('accepts an order when the legacy "company" field is autofilled', async () => {
    const res = await post(validOrder({ company: 'ТОВ Ромашка' }));
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(json.orderId).not.toBe('TC-000000');
    expect(telegram()).toBeDefined();
  });

  it('still delivers the order when the real trap is filled, but flags it', async () => {
    const res = await post(validOrder({ botField: 'http://spam.example' }));
    const json = await res.json();

    expect(json.ok).toBe(true);
    expect(json.orderId).not.toBe('TC-000000');

    const tg = telegram();
    expect(tg).toBeDefined();
    expect(tg!.body.text).toContain('антибот');
  });
});

describe('pricing is server-side', () => {
  it('ignores client-supplied prices and totals', async () => {
    const res = await post(
      validOrder({
        items: [{ slug: item.slug, weight: itemWeight, qty: 1, price: 1, lineTotal: 1 }],
        total: 1,
        subtotal: 1,
      }),
    );
    const json = await res.json();

    const expectedDelivery = itemPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    expect(json.total).toBe(itemPrice + expectedDelivery);
  });

  it('charges delivery below the free threshold and drops it above', async () => {
    const cheap = products
      .flatMap((p) => p.priceTiers.map((t) => ({ p, t })))
      .find(({ t }) => t.price < FREE_DELIVERY_THRESHOLD);
    expect(cheap, 'fixture: need an item under the free-delivery threshold').toBeDefined();

    const below = await post(
      validOrder({ items: [{ slug: cheap!.p.slug, weight: cheap!.t.weight, qty: 1 }] }),
    );
    expect((await below.json()).total).toBe(cheap!.t.price + DELIVERY_FEE);

    const qty = Math.ceil(FREE_DELIVERY_THRESHOLD / cheap!.t.price);
    const above = await post(
      validOrder({ items: [{ slug: cheap!.p.slug, weight: cheap!.t.weight, qty }] }),
    );
    expect((await above.json()).total).toBe(cheap!.t.price * qty);
  });
});

describe('validation', () => {
  // Regression: the rejection helper called itself, so every invalid payload
  // blew the stack and returned a 500 instead of a readable 400.
  it.each([
    ['short name', { first: 'О' }],
    ['missing surname', { last: '' }],
    ['bad phone', { phone: '123' }],
    ['no delivery method', { deliveryMethod: 'pigeon' }],
    ['no city', { cityRef: '', cityName: '' }],
    ['branch without warehouse', { warehouseRef: '', warehouse: '' }],
    ['courier without address', { deliveryMethod: 'np_courier', address: 'вул' }],
    ['empty cart', { items: [] }],
    ['unknown product', { items: [{ slug: 'nope/nope', weight: 25, qty: 1 }] }],
    ['zero quantity', { items: [{ slug: item.slug, weight: itemWeight, qty: 0 }] }],
    ['absurd quantity', { items: [{ slug: item.slug, weight: itemWeight, qty: 1000 }] }],
    ['unavailable weight', { items: [{ slug: item.slug, weight: 999999, qty: 1 }] }],
  ])('rejects %s with 400 and never sends to Telegram', async (_label, override) => {
    const res = await post(validOrder(override));

    expect(res.status).toBe(400);
    expect((await res.json()).ok).toBe(false);
    expect(telegram()).toBeUndefined();
  });

  it('rejects a malformed body', async () => {
    ip += 1;
    const res = await POST(
      new Request('http://localhost/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `10.1.0.${ip}` },
        body: 'not json',
      }),
    );
    expect(res.status).toBe(400);
  });
});

describe('infrastructure failures', () => {
  it('returns 503 when Telegram credentials are missing', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    const res = await post(validOrder());
    expect(res.status).toBe(503);
    expect(telegram()).toBeUndefined();
  });

  it('returns 502 when Telegram rejects the message', async () => {
    vi.stubGlobal('fetch', async () => new Response('bad request', { status: 400 }));
    const res = await post(validOrder());
    expect(res.status).toBe(502);
  });

  it('rate limits repeat submissions from one IP', async () => {
    const headers = { 'x-forwarded-for': '203.0.113.99' };
    const codes: number[] = [];
    for (let i = 0; i < 7; i++) {
      const res = await POST(
        new Request('http://localhost/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify(validOrder()),
        }),
      );
      codes.push(res.status);
    }
    expect(codes).toContain(429);
  });
});
