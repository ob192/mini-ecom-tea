/**
 * Server-only Meta Conversions API client — `Purchase` only.
 *
 * Why this exists at all, given the Meta pixel is wired up in GTM:
 *
 * The GTM container (version 9) carries Meta's own generated tags, and its
 * event-name lookup does map `purchase` → `Purchase`. But this site never
 * pushes `purchase` to the dataLayer — by design, see `lib/analytics.ts`: only
 * the server knows the authoritative recomputed total, and a browser hit is
 * lost to ad-blockers. So the GTM mapping is wired to an event that can never
 * arrive, and Meta would receive the whole funnel (PageView → ViewContent →
 * AddToCart → InitiateCheckout) with nothing at the end of it.
 *
 * That is not a tuning problem, it is the difference between Meta being able
 * to optimise for purchases and not. Hence this module: the same server-side
 * treatment `lib/ga4-server.ts` gives GA4, pointed at the Graph API.
 *
 * Deduplication: `event_id` is the order id. If a browser-side `Purchase` is
 * ever added (don't — see `lib/analytics.ts`), Meta collapses the pair as long
 * as both carry the same `event_id` and `event_name`.
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import { createHash } from 'node:crypto';

const GRAPH_VERSION = 'v21.0';

export interface CapiItem {
  /**
   * Must match the `item_id` the browser events send, which is the product
   * slug (`lib/analytics.ts` → `toGaItem`). The Google feed uses `offerId()`
   * (`puer-gongting-gongbing-shu-25g`) instead — a different scheme on
   * purpose, because that one is keyed to Merchant Center history. If a Meta
   * catalogue is ever created, whichever scheme it uses has to be adopted on
   * both the browser and server side together, or the funnel stops matching.
   */
  id: string;
  quantity: number;
  item_price: number;
}

export interface CapiPurchase {
  orderId: string;
  value: number;
  currency: string;
  items: CapiItem[];
  /** Customer phone, already normalised to E.164 by `normalizeUaPhone`. */
  phone?: string;
  eventSourceUrl?: string;
}

export interface FbIdentifiers {
  fbp: string | null;
  fbc: string | null;
  clientIp: string | null;
  userAgent: string | null;
}

/**
 * Pull Meta's first-party click/browser cookies off the order request.
 *
 * `_fbp` is set by the pixel on first visit (confirmed present on the live
 * site); `_fbc` only exists when the visitor arrived on an `fbclid` link, so
 * it is legitimately null for organic traffic. Together they are what lets a
 * server event join the browser session that produced the ad click — without
 * them a Purchase lands unattributed and the ad that earned it gets no credit.
 */
export function readFbCookies(cookieHeader: string | null): { fbp: string | null; fbc: string | null } {
  if (!cookieHeader) return { fbp: null, fbc: null };
  const jar = new Map<string, string>();
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    jar.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
  }
  return { fbp: jar.get('_fbp') ?? null, fbc: jar.get('_fbc') ?? null };
}

/** Meta requires every PII field SHA-256'd, lowercase hex, after normalisation. */
function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Phone → Meta's expected form: digits only, country code included, no `+`,
 * then hashed. `normalizeUaPhone` has already produced `+380XXXXXXXXX`.
 */
export function hashPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  return hash(digits);
}

/**
 * Send the `Purchase` event. Never throws — analytics must not be able to fail
 * an order that Telegram has already accepted.
 *
 * Advanced matching (hashing the customer's phone into `user_data`) is OFF
 * unless `META_CAPI_ADVANCED_MATCHING=1`. It measurably improves attribution,
 * but it means sending customer data — hashed, but still customer data — to
 * Meta, which is a disclosure decision for `/privacy` rather than a technical
 * default. Cookies-only works without it.
 */
export async function sendMetaPurchase(
  purchase: CapiPurchase,
  ids: FbIdentifiers,
): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) {
    console.warn('[meta] META_PIXEL_ID / META_CAPI_ACCESS_TOKEN not set — Purchase not tracked');
    return;
  }

  const advancedMatching = process.env.META_CAPI_ADVANCED_MATCHING === '1';
  const hashedPhone = advancedMatching && purchase.phone ? hashPhone(purchase.phone) : null;

  const userData: Record<string, unknown> = {
    ...(ids.fbp ? { fbp: ids.fbp } : {}),
    ...(ids.fbc ? { fbc: ids.fbc } : {}),
    ...(ids.clientIp ? { client_ip_address: ids.clientIp } : {}),
    ...(ids.userAgent ? { client_user_agent: ids.userAgent } : {}),
    ...(hashedPhone ? { ph: [hashedPhone] } : {}),
  };

  // Meta rejects an event with no way at all to attribute it. Report the
  // revenue anyway rather than dropping it — same trade-off as ga4-server.
  if (Object.keys(userData).length === 0) {
    console.warn('[meta] no fbp/fbc/ip/ua on the order request — Purchase sent unattributed');
  }

  // A value of "0" or blank means "off", not "a test code called 0". This repo
  // sets boolean-ish env vars to "0" rather than leaving them empty
  // (GA4_MP_DEBUG is "0" in production), and a truthiness check would read that
  // as a live test code — which routes every Purchase to the Test Events tab,
  // where it is validated and never recorded. That is the silent-revenue-loss
  // failure HANDOFF.md warns about for GA4_MP_DEBUG; same trap, same shape.
  const testCode = (process.env.META_CAPI_TEST_EVENT_CODE ?? '').trim();
  const testEventCode = testCode && testCode !== '0' ? testCode : null;

  const body = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: purchase.orderId,
        action_source: 'website',
        ...(purchase.eventSourceUrl ? { event_source_url: purchase.eventSourceUrl } : {}),
        user_data: userData,
        custom_data: {
          currency: purchase.currency,
          value: purchase.value,
          order_id: purchase.orderId,
          content_type: 'product',
          content_ids: purchase.items.map((i) => i.id),
          contents: purchase.items,
          num_items: purchase.items.reduce((n, i) => n + i.quantity, 0),
        },
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(
    pixelId,
  )}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3_000),
    });
    if (!res.ok) {
      // Graph errors are descriptive (bad token, unhashed PII, stale pixel) and
      // invisible otherwise — the Events Manager just shows nothing arriving.
      console.error('[meta] CAPI responded', res.status, await res.text().catch(() => ''));
    } else if (testEventCode) {
      console.info('[meta] CAPI test response', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('[meta] Purchase not sent', err);
  }
}
