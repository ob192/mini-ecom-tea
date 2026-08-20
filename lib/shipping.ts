/**
 * Delivery terms — the single source for the two numbers the whole shop quotes.
 *
 * These used to be copy-pasted into `context/CartContext.tsx` (cart display),
 * `app/api/order/route.ts` (the authoritative server-side total) and
 * `lib/merchant-feed.ts` (`g:shipping`), with the same pair written out again as
 * prose in `app/delivery/page.tsx` and the `CatalogGrid` banner. That is four
 * places to change and three ways to get it half-done — and Merchant Center
 * compares the feed's shipping cost against what the landing page says, so a
 * half-done change is a disapproval. The feed once published 60 while the page
 * said 80, which is exactly that failure.
 *
 * The prose copies cannot be collapsed into an import (they are sentences, not
 * values), so they still have to be updated by hand — but everything that
 * computes with these numbers now reads them from here.
 */

/** Order subtotal (UAH) at or above which delivery is free. */
export const FREE_DELIVERY_THRESHOLD = 500;

/** Flat delivery charge (UAH) below the threshold. */
export const DELIVERY_FEE = 100;

/**
 * Days the customer has to return an item, per ЗУ «Про захист прав споживачів».
 * Stated on /returns and published as `hasMerchantReturnPolicy` in the Product
 * structured data, which Google cross-checks against the page.
 */
export const RETURN_WINDOW_DAYS = 14;

/** Delivery charge for a basket of exactly this value. */
export function deliveryFeeFor(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}
