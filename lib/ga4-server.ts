/**
 * Server-only GA4 Measurement Protocol client.
 *
 * `purchase` is the one event we do NOT send from the browser: the server is
 * the only place that knows the authoritative, recomputed total, and an
 * MP hit isn't lost to ad-blockers. GA4_API_SECRET never reaches the client.
 *
 * Docs: https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */

const MP_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const MP_DEBUG_ENDPOINT = 'https://www.google-analytics.com/debug/mp/collect';

export interface MpItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
}

export interface PurchaseEvent {
  transaction_id: string;
  value: number;
  currency: string;
  shipping?: number;
  items: MpItem[];
  /**
   * The page the order was placed from. A Measurement Protocol hit carries no
   * browser context, so without this GA4 reports the purchase against
   * "(not set)". Derived from NEXT_PUBLIC_SITE_URL via siteUrl().
   */
  page_location?: string;
}

/**
 * Pull the GA4 identifiers out of the first-party cookies the browser sent
 * with the order request, so the purchase joins the visitor's real session
 * (source/medium, campaign, device) instead of landing as a new "direct" user.
 *
 * `_ga`             → GA1.1.<client_id>            (client_id = "1234567890.1700000000")
 * `_ga_<STREAM_ID>` → GS1.1.<session_id>.…         (legacy format)
 *                   → GS2.1.s<session_id>$o1$…     (2024+ format)
 */
export function readGaCookies(
  cookieHeader: string | null,
  measurementId: string,
): { clientId: string | null; sessionId: string | null } {
  if (!cookieHeader) return { clientId: null, sessionId: null };

  const jar = new Map<string, string>();
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    jar.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
  }

  const ga = jar.get('_ga');
  // "GA1.1.1234567890.1700000000" -> "1234567890.1700000000"
  const clientId = ga && /^GA\d\.\d+\./.test(ga) ? ga.split('.').slice(2).join('.') : null;

  const streamCookie = jar.get(`_ga_${measurementId.replace(/^G-/, '')}`);
  let sessionId: string | null = null;
  if (streamCookie) {
    const modern = streamCookie.match(/\bs(\d{6,})\b/); // GS2.1.s1700000000$o1$…
    const legacy = streamCookie.split('.')[2]; // GS1.1.1700000000.1.…
    sessionId = modern?.[1] ?? (/^\d{6,}$/.test(legacy ?? '') ? legacy : null);
  }

  return { clientId: clientId || null, sessionId };
}

/**
 * Send a `purchase` event. Never throws — analytics must not be able to fail
 * an order that has already been accepted.
 */
export async function sendPurchase(
  purchase: PurchaseEvent,
  ids: { clientId: string | null; sessionId: string | null },
): Promise<void> {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret) {
    console.warn('[ga4] GA4_MEASUREMENT_ID / GA4_API_SECRET not set — purchase not tracked');
    return;
  }

  // No `_ga` cookie (blocked, first visit before the tag loaded, cookies
  // cleared): still report the revenue rather than losing it. The hit lands as
  // a fresh unattributed user, so a small "direct" skew is the trade-off.
  const clientId = ids.clientId ?? `${Math.floor(Math.random() * 1e10)}.${Math.floor(Date.now() / 1000)}`;

  const debug = process.env.GA4_MP_DEBUG === '1';
  const url = `${debug ? MP_DEBUG_ENDPOINT : MP_ENDPOINT}?measurement_id=${encodeURIComponent(
    measurementId,
  )}&api_secret=${encodeURIComponent(apiSecret)}`;

  const body = {
    client_id: clientId,
    // Server hits are non-personalised; no customer data is ever sent.
    non_personalized_ads: false,
    events: [
      {
        name: 'purchase',
        params: {
          ...purchase,
          ...(ids.sessionId ? { session_id: ids.sessionId } : {}),
          engagement_time_msec: 1,
        },
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3_000),
    });
    if (debug) {
      console.info('[ga4] MP debug response', res.status, await res.text().catch(() => ''));
    } else if (!res.ok) {
      console.error('[ga4] MP responded', res.status);
    }
  } catch (err) {
    console.error('[ga4] purchase not sent', err);
  }
}
