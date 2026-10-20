import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { readFbCookies, hashPhone, sendMetaPurchase } from '@/lib/meta-capi';
import { POST } from '@/app/api/order/route';
import { products, priceFor } from '@/lib/products';

/*
  Meta Conversions API — the server-side `Purchase`.

  The point of these tests is one structural fact that is easy to undo by
  accident: this site never pushes `purchase` to the dataLayer, so the GTM
  container's `purchase` → `Purchase` mapping is wired to an event that never
  fires. This module is the only thing that gives Meta a conversion, and
  nothing in the UI would look broken if it silently stopped.
*/

const PHONE_DIGEST = 'bb078b64236f6302e0b050fd5084e9ddcfdc3cdbec3954573b635dbc277bb063';

describe('readFbCookies', () => {
  it('pulls _fbp and _fbc out of a cookie header', () => {
    expect(readFbCookies('_ga=GA1.1.1.2; _fbp=fb.1.1700000000.123; _fbc=fb.1.1700000000.abc'))
      .toEqual({ fbp: 'fb.1.1700000000.123', fbc: 'fb.1.1700000000.abc' });
  });

  it('returns nulls for a missing header', () => {
    expect(readFbCookies(null)).toEqual({ fbp: null, fbc: null });
  });

  it('treats a missing _fbc as null — organic visitors never have one', () => {
    expect(readFbCookies('_fbp=fb.1.1700000000.123')).toEqual({
      fbp: 'fb.1.1700000000.123',
      fbc: null,
    });
  });

  it('ignores a cookie whose name merely contains _fbp', () => {
    expect(readFbCookies('not_fbp_really=x').fbp).toBeNull();
  });
});

describe('hashPhone', () => {
  it('strips the + and hashes the digits, lowercase hex', () => {
    expect(hashPhone('+380986575800')).toBe(PHONE_DIGEST);
  });

  it('normalises formatting away, so the same number always matches', () => {
    expect(hashPhone('+38 (098) 657-58-00')).toBe(PHONE_DIGEST);
  });

  it('never returns the number itself', () => {
    const h = hashPhone('+380986575800')!;
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toContain('380986575800');
  });

  it('refuses something too short to be a phone number', () => {
    expect(hashPhone('12345')).toBeNull();
  });
});

describe('sendMetaPurchase', () => {
  let sent: { url: string; body: any }[] = [];

  const purchase = {
    orderId: 'TC-123456',
    value: 610,
    currency: 'UAH',
    phone: '+380986575800',
    eventSourceUrl: 'https://jintea.restreto-labs.com/order/success',
    items: [{ id: 'puer/gongting-gongbing-shu', quantity: 2, item_price: 255 }],
  };
  const ids = { fbp: 'fb.1.1700000000.123', fbc: null, clientIp: '1.2.3.4', userAgent: 'UA/1.0' };

  beforeEach(() => {
    sent = [];
    process.env.META_PIXEL_ID = '1480203177363951';
    process.env.META_CAPI_ACCESS_TOKEN = 'test-token';
    delete process.env.META_CAPI_ADVANCED_MATCHING;
    delete process.env.META_CAPI_TEST_EVENT_CODE;
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      sent.push({ url: String(url), body: init?.body ? JSON.parse(String(init.body)) : null });
      return new Response(JSON.stringify({ events_received: 1 }), { status: 200 });
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.META_PIXEL_ID;
    delete process.env.META_CAPI_ACCESS_TOKEN;
    delete process.env.META_CAPI_ADVANCED_MATCHING;
  });

  it('posts a Purchase to the pixel-scoped Graph endpoint', async () => {
    await sendMetaPurchase(purchase, ids);
    expect(sent).toHaveLength(1);
    expect(sent[0].url).toContain('/1480203177363951/events');
    expect(sent[0].body.data[0].event_name).toBe('Purchase');
    expect(sent[0].body.data[0].action_source).toBe('website');
  });

  it('uses the order id as event_id so a browser duplicate would collapse', async () => {
    await sendMetaPurchase(purchase, ids);
    expect(sent[0].body.data[0].event_id).toBe('TC-123456');
    expect(sent[0].body.data[0].custom_data.order_id).toBe('TC-123456');
  });

  it('reports the recomputed total and the cart contents', async () => {
    await sendMetaPurchase(purchase, ids);
    const cd = sent[0].body.data[0].custom_data;
    expect(cd.value).toBe(610);
    expect(cd.currency).toBe('UAH');
    expect(cd.content_type).toBe('product');
    expect(cd.content_ids).toEqual(['puer/gongting-gongbing-shu']);
    expect(cd.num_items).toBe(2);
    expect(cd.contents).toEqual([
      { id: 'puer/gongting-gongbing-shu', quantity: 2, item_price: 255 },
    ]);
  });

  it('passes the cookies, IP and user agent through as user_data', async () => {
    await sendMetaPurchase(purchase, ids);
    const ud = sent[0].body.data[0].user_data;
    expect(ud.fbp).toBe('fb.1.1700000000.123');
    expect(ud.client_ip_address).toBe('1.2.3.4');
    expect(ud.client_user_agent).toBe('UA/1.0');
    expect(ud).not.toHaveProperty('fbc'); // organic visitor
  });

  /*
    Advanced matching sends customer data — hashed, but still customer data —
    to Meta, which is a /privacy disclosure decision, not a default. Opt-in
    only, and the raw number must never appear in the payload either way.
  */
  it('sends no phone data unless advanced matching is switched on', async () => {
    await sendMetaPurchase(purchase, ids);
    expect(sent[0].body.data[0].user_data).not.toHaveProperty('ph');
    expect(JSON.stringify(sent[0].body)).not.toContain('380986575800');
  });

  it('sends the hashed phone when META_CAPI_ADVANCED_MATCHING=1', async () => {
    process.env.META_CAPI_ADVANCED_MATCHING = '1';
    await sendMetaPurchase(purchase, ids);
    expect(sent[0].body.data[0].user_data.ph).toEqual([PHONE_DIGEST]);
    expect(JSON.stringify(sent[0].body)).not.toContain('380986575800');
  });

  /*
    GA4_MP_DEBUG is "0" in production, not empty — this repo switches flags off
    by value, not by absence. A truthiness check on the test code would read
    that convention as a live TEST code and route every Purchase to the Test
    Events tab, where Meta validates it and never records it.
  */
  it.each(['0', '', '   '])('treats META_CAPI_TEST_EVENT_CODE=%o as off', async (v) => {
    process.env.META_CAPI_TEST_EVENT_CODE = v;
    await sendMetaPurchase(purchase, ids);
    expect(sent[0].body).not.toHaveProperty('test_event_code');
  });

  it('sends a real test code through', async () => {
    process.env.META_CAPI_TEST_EVENT_CODE = 'TEST12345';
    await sendMetaPurchase(purchase, ids);
    expect(sent[0].body.test_event_code).toBe('TEST12345');
  });

  it('does nothing when the pixel id or token is unset', async () => {
    delete process.env.META_CAPI_ACCESS_TOKEN;
    await sendMetaPurchase(purchase, ids);
    expect(sent).toHaveLength(0);
  });

  it('never throws when the Graph API errors', async () => {
    vi.stubGlobal('fetch', async () => new Response('{"error":{"message":"bad token"}}', { status: 400 }));
    await expect(sendMetaPurchase(purchase, ids)).resolves.toBeUndefined();
  });

  it('never throws when the request itself fails', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new Error('network down');
    });
    await expect(sendMetaPurchase(purchase, ids)).resolves.toBeUndefined();
  });
});

/*
  End to end through the real route: the GTM container can map `purchase` to
  `Purchase` all it likes, but the only place that event can originate is here.
*/
describe('the order endpoint sends the Meta Purchase', () => {
  const item = products.find((p) => p.priceTiers.length > 0)!;
  const weight = item.priceTiers[0].weight;
  let sent: { url: string; body: any }[] = [];
  let ip = 200;

  beforeEach(() => {
    sent = [];
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.TELEGRAM_CHAT_ID = '-100123';
    process.env.META_PIXEL_ID = '1480203177363951';
    process.env.META_CAPI_ACCESS_TOKEN = 'test-token';
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
    delete process.env.META_PIXEL_ID;
    delete process.env.META_CAPI_ACCESS_TOKEN;
  });

  function post(body: unknown, headers: Record<string, string> = {}) {
    ip += 1;
    return POST(
      new Request('http://localhost/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': `10.0.1.${ip % 250}`,
          ...headers,
        },
        body: JSON.stringify(body),
      }),
    );
  }

  const order = {
    first: 'Олена',
    last: 'Коваленко',
    phone: '+380986575800',
    deliveryMethod: 'np_warehouse',
    cityName: 'Київ',
    cityRef: 'city-ref',
    warehouse: 'Відділення №1',
    warehouseRef: 'wh-ref',
    address: '',
    items: [{ slug: item.slug, weight, qty: 1 }],
  };

  const meta = () => sent.find((s) => s.url.includes('graph.facebook.com'));

  it('fires a Purchase with the server-recomputed total', async () => {
    const res = await post(order, { cookie: '_fbp=fb.1.1700000000.123' });
    const json = await res.json();
    expect(res.status).toBe(200);

    const hit = meta();
    expect(hit).toBeDefined();
    const event = hit!.body.data[0];
    expect(event.event_name).toBe('Purchase');
    expect(event.event_id).toBe(json.orderId);
    expect(event.custom_data.value).toBe(json.total);
    expect(event.custom_data.currency).toBe('UAH');
    expect(event.user_data.fbp).toBe('fb.1.1700000000.123');
  });

  it('uses the product slug as content id, matching the browser events', async () => {
    await post(order, { cookie: '_fbp=fb.1.1700000000.123' });
    expect(meta()!.body.data[0].custom_data.content_ids).toEqual([item.slug]);
  });

  /*
    The honeypot flags, it does not drop — `route.ts:76` logs "flagging, NOT
    dropping" and the Telegram message carries a warning banner, because the
    field once ate real orders when browsers autofilled it. A flagged order is
    therefore still a real order as far as revenue goes, so it reports a
    Purchase, exactly as the GA4 server-side `purchase` already does. Keep the
    two consistent: counting in one and not the other is worse than either.
  */
  it('still reports a Purchase for a honeypot-flagged order, as GA4 does', async () => {
    const res = await post({ ...order, botField: 'spam' });
    expect(res.status).toBe(200);
    expect(meta()).toBeDefined();
    expect(sent.find((s) => s.url.includes('api.telegram.org'))!.body.text)
      .toContain('антибот');
  });

  it('still accepts the order when Meta is unreachable', async () => {
    vi.stubGlobal('fetch', async (url: string) => {
      if (String(url).includes('graph.facebook.com')) throw new Error('network down');
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });
    const res = await post(order);
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });
});
