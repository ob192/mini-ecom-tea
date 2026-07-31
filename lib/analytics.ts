/**
 * Client-side analytics: everything is pushed to the GTM `dataLayer`, and GTM
 * forwards it to GA4 (stream G-5PCX5S995S). Nothing here talks to Google
 * directly — swapping/adding a destination is a GTM-side change only.
 *
 * The one exception is `purchase`, which is sent server-side from
 * `app/api/order/route.ts` via the Measurement Protocol (`lib/ga4-server.ts`):
 * only the server knows the authoritative total, and it is not blocked by
 * ad-blockers. Do NOT also push `purchase` from the client — it would double
 * count revenue.
 *
 * Event names follow the GA4 recommended ecommerce schema:
 * https://developers.google.com/analytics/devguides/collection/ga4/reference/events
 */

import type { CartItem, Product } from '@/lib/types';
import { CURRENCY, UNIT, categoryLabel, getProduct, priceFor } from '@/lib/products';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/** A single GA4 ecommerce item. */
export interface GaItem {
  item_id: string;
  item_name: string;
  item_category: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
  index?: number;
}

export function pushDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

/**
 * Push an ecommerce event. The `ecommerce: null` reset is required by GA4 —
 * without it GTM merges the items of the previous event into this one.
 */
function pushEcommerce(event: string, ecommerce: Record<string, unknown>): void {
  pushDataLayer({ ecommerce: null });
  pushDataLayer({ event, ecommerce: { currency: CURRENCY, ...ecommerce } });
}

/** Product (+ chosen tier) → GA4 item. `weight` 0 means "no tier" (teaware). */
export function toGaItem(
  product: Product,
  weight?: number,
  qty = 1,
  index?: number,
): GaItem {
  const price = weight != null ? priceFor(product, weight) : product.price;
  return {
    item_id: product.slug,
    item_name: product.title,
    item_category: categoryLabel(product.category),
    ...(weight ? { item_variant: `${weight} ${UNIT}` } : {}),
    ...(price != null ? { price } : {}),
    quantity: qty,
    ...(index != null ? { index } : {}),
  };
}

/** Cart lines → GA4 items, dropping lines whose product/price no longer resolves. */
export function cartToGaItems(items: CartItem[]): GaItem[] {
  return items.flatMap((line, i) => {
    const product = getProduct(line.slug);
    if (!product) return [];
    return [toGaItem(product, line.weight, line.qty, i)];
  });
}

/** Item-only value of the cart (delivery is reported separately). */
export function cartValue(items: CartItem[]): number {
  return items.reduce((sum, line) => {
    const product = getProduct(line.slug);
    const price = product ? priceFor(product, line.weight) : null;
    return sum + (price ?? 0) * line.qty;
  }, 0);
}

const round = (n: number) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------ */
/* Ecommerce funnel                                                    */
/* ------------------------------------------------------------------ */

export function trackViewItemList(
  products: Product[],
  listId: string,
  listName: string,
): void {
  pushEcommerce('view_item_list', {
    item_list_id: listId,
    item_list_name: listName,
    // GA4 caps a payload at ~200 items; the catalog is small but stay safe.
    items: products.slice(0, 50).map((p, i) => toGaItem(p, undefined, 1, i)),
  });
}

export function trackSelectItem(
  product: Product,
  listId: string,
  listName: string,
  index?: number,
): void {
  pushEcommerce('select_item', {
    item_list_id: listId,
    item_list_name: listName,
    items: [toGaItem(product, undefined, 1, index)],
  });
}

export function trackViewItem(product: Product, weight?: number): void {
  const item = toGaItem(product, weight);
  pushEcommerce('view_item', { value: item.price ?? 0, items: [item] });
}

export function trackAddToCart(product: Product, weight: number, qty: number): void {
  const item = toGaItem(product, weight, qty);
  pushEcommerce('add_to_cart', { value: round((item.price ?? 0) * qty), items: [item] });
}

export function trackRemoveFromCart(product: Product, weight: number, qty: number): void {
  const item = toGaItem(product, weight, qty);
  pushEcommerce('remove_from_cart', { value: round((item.price ?? 0) * qty), items: [item] });
}

export function trackViewCart(items: CartItem[]): void {
  pushEcommerce('view_cart', {
    value: round(cartValue(items)),
    items: cartToGaItems(items),
  });
}

export function trackBeginCheckout(items: CartItem[]): void {
  pushEcommerce('begin_checkout', {
    value: round(cartValue(items)),
    items: cartToGaItems(items),
  });
}

/** Fired once the customer has picked a Nova Poshta delivery option. */
export function trackAddShippingInfo(items: CartItem[], shippingTier: string): void {
  pushEcommerce('add_shipping_info', {
    value: round(cartValue(items)),
    shipping_tier: shippingTier,
    items: cartToGaItems(items),
  });
}

/* ------------------------------------------------------------------ */
/* Behavioural / engagement                                            */
/* ------------------------------------------------------------------ */

/** SPA page view — see components/Analytics.tsx for why this is manual. */
export function trackPageView(url: string, title: string): void {
  pushDataLayer({
    event: 'page_view',
    page_location: url,
    page_path: new URL(url, 'https://x').pathname,
    page_title: title,
  });
}

/** Catalog category chip / filter usage. */
export function trackSelectCategory(category: string, label: string): void {
  pushDataLayer({ event: 'select_category', category, category_label: label });
}

/** Phone / Telegram / Instagram taps — GA4 enhanced measurement misses tel: links. */
export function trackContactClick(channel: 'phone' | 'telegram' | 'instagram', location: string): void {
  pushDataLayer({ event: 'contact_click', contact_channel: channel, contact_location: location });
}

/** Checkout submit that came back with a validation/API error. */
export function trackCheckoutError(reason: string): void {
  pushDataLayer({ event: 'checkout_error', error_reason: reason.slice(0, 100) });
}
