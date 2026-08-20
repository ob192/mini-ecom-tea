# Analytics — GTM + GA4

Container: **GTM-MKJP47L5** · GA4 stream: **Jintea Restreto Labs**, measurement ID **G-5PCX5S995S**.

The site never calls Google directly from the browser: every client-side signal is
pushed to the GTM `dataLayer` (`lib/analytics.ts`) and GTM decides what to do with it.
The single exception is `purchase`, sent server-side over the Measurement Protocol
(`lib/ga4-server.ts` → `app/api/order/route.ts`).

## Environment variables

| Variable | Where | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_GTM_ID` | client | `GTM-MKJP47L5` — unset it to disable all tracking (previews, local work) |
| `GA4_MEASUREMENT_ID` | server | `G-5PCX5S995S` |
| `GA4_API_SECRET` | server | Measurement Protocol secret ("JINTEA API SECRET") — **secret, never commit** |
| `GA4_MP_DEBUG` | server | `1` → POST to `/debug/mp/collect` and log validation errors instead of recording hits |
| `NEXT_PUBLIC_SITE_URL` | both | `https://jintea.restreto-labs.com` — the domain the shop actually runs on, and the one the GA4 stream is registered to. Not used by client tracking (the browser supplies the real URL), but the server-side `purchase` has no browser context, so it stamps `page_location` from this. Unset in production it falls back to the per-deployment `VERCEL_URL`. |

Set all four in Vercel → Project → Settings → Environment Variables (production +
preview). Locally they live in `.env.local`.

## What the site pushes

| dataLayer event | Fired from | Notes |
| --- | --- | --- |
| `spa_page_view` | `components/Analytics.tsx` | **Client-side route changes only.** The first page view is sent by the Google tag itself. GTM re-emits this as a GA4 `page_view`. |
| `view_item_list` | `CatalogGrid` | On load and on every category filter change; `item_list_id` = `catalog_<cat>`. |
| `select_item` | `ProductCard` | Card image or title click. |
| `view_item` | `ProductBuy` | Once per product page, at the default weight tier. |
| `add_to_cart` | `ProductCard`, `ProductBuy` | Quick add from the grid, and the product page buy box. |
| `remove_from_cart` | `CartView` | Trash button. |
| `view_cart` | `CartView` | Once per visit to `/cart`, after cart hydration. |
| `begin_checkout` | `CheckoutForm` | Once per visit to `/checkout` with a non-empty cart. |
| `add_shipping_info` | `CheckoutForm` | On a valid submit; `shipping_tier` = branch vs courier. |
| `select_category` | `CatalogGrid` | Catalog filter chips. Params: `category`, `category_label`. |
| `contact_click` | `Footer`, `/contacts`, `/order/success` | Phone / Telegram / Instagram taps — GA4 enhanced measurement can't see `tel:` links. Params: `contact_channel`, `contact_location`. |
| `checkout_error` | `CheckoutForm` | Validation or API failure at submit. Param: `error_reason`. |
| `purchase` | **server** (`/api/order`) | Not in the dataLayer — see below. |

Ecommerce events follow the GA4 schema: every push is preceded by an
`{ ecommerce: null }` reset, and the payload sits under `ecommerce` with
`currency: 'UAH'`, `value`, and `items[]`.

`item_id` is the product slug (`puer/gongting-gongbing-shu`), `item_variant` is the
weight tier (`50 г`), `item_category` is the Ukrainian category label.

## Why `purchase` is server-side

The order API recomputes the price of every line from `public/products.json` and never
trusts the client, so the server is the only place that knows the real total. It also
can't be blocked by an ad-blocker, and it only fires after Telegram has accepted the
order — so GA4 revenue matches the orders the shop actually received.

`app/api/order/route.ts` reads the visitor's `_ga` / `_ga_5PCX5S995S` cookies off the
request, so the purchase joins their existing session (source / medium / campaign)
instead of appearing as a new direct user. `value` = items + delivery, with `shipping`
reported separately; `transaction_id` is the `TC-XXXXXX` order id shown to the customer.
No customer name, phone or address is ever sent to Google.

**Do not add a client-side `purchase` tag in GTM** — it would double count revenue.

## GTM container configuration

The code is done; the container still has to be built. In GTM:

### Variables
Enable the built-in **Event** variable, then add these **Data Layer Variables**
(name = variable name): `page_location`, `page_title`, `page_path`,
`contact_channel`, `contact_location`, `category`, `category_label`, `error_reason`.

### Tags

1. **Google tag — GA4**
   Tag type *Google tag*, Tag ID `G-5PCX5S995S`.
   Trigger: *Initialization — All Pages*.
   This one sends the initial `page_view`.

2. **GA4 event — SPA page_view**
   Tag type *Google Analytics: GA4 event*, Measurement ID `G-5PCX5S995S`,
   Event Name `page_view`, parameters `page_location`, `page_title`, `page_path`
   mapped to the data layer variables above.
   Trigger: *Custom Event*, regex `^(page_view|spa_page_view)$` — both names are
   accepted so a deploy can't open a gap between the site and the container.

3. **GA4 event — Ecommerce** (one tag covers all of them)
   Event Name `{{Event}}`, tick **Send Ecommerce data → Data Layer**.
   Trigger: *Custom Event*, "use regex matching":
   `^(view_item_list|select_item|view_item|add_to_cart|remove_from_cart|view_cart|begin_checkout|add_shipping_info)$`

4. **GA4 event — Behaviour** (one tag)
   Event Name `{{Event}}`, parameters `contact_channel`, `contact_location`,
   `category`, `category_label`, `error_reason` (GTM drops the ones that are
   undefined for a given event).
   Trigger: *Custom Event*, regex `^(contact_click|select_category|checkout_error)$`

### Don't track yourself
Add an **exception** to every tag (or a blocking trigger): *Page Hostname* contains
`localhost`. GTM Preview mode still works with a blocked container, and it keeps dev
traffic out of the property. Also add an internal-traffic IP filter in
GA4 → Admin → Data Streams → Configure tag settings → Define internal traffic.

## GA4 property settings

- **Enhanced measurement**: keep scrolls, outbound clicks, site search, file downloads.
  **Turn OFF "Page changes based on browser history events"** — the app pushes its own
  `page_view` on route changes, and leaving both on double counts every SPA navigation.
- `purchase` is a key event by default. Mark `begin_checkout` and `contact_click` as key
  events too if you want them in conversion reports.
- The stream URL (`https://jintea.restreto-labs.com`) matches `NEXT_PUBLIC_SITE_URL`.
  Keep them in sync if the shop ever moves domain.
- **One hostname only.** A "Pages and screens" report split by hostname means an alias
  domain is serving the site directly instead of redirecting: `jintea.shop` did exactly
  that (36 views vs 27 over 28 days) because both hosts pointed at the same deployment and
  ran the same container. `page_location` carries the hostname, so the two never merge in
  GA4 and every landing-page and attribution report is halved. The redirect lives in
  `next.config.mjs` — see CLAUDE.md → Routing. Historical data stays split; sessions from
  before the redirect can't be rewritten.

## Verifying

> **Publishing a container version does not take effect immediately in a browser
> that already has it.** `gtm.js` is served with `Cache-Control: private,
> max-age=900`, so a tab can run a container up to 15 minutes old. Before
> concluding a tag "doesn't fire", refresh the cached copy —
> `fetch('https://www.googletagmanager.com/gtm.js?id=GTM-MKJP47L5',{cache:'reload'})`
> then reload the page. This cost a full debugging cycle once already.

- **GTM Preview** (Tag Assistant) against the deployed site: walk catalog → product →
  cart → checkout and confirm each event above fires once.
- **GA4 → Admin → DebugView** shows the same events with their parameters.
- **Server purchase**: set `GA4_MP_DEBUG=1`, place a test order, and check the function
  logs for `[ga4] MP debug response 200 {"validationMessages": []}`. Unset it afterwards
  — debug hits are validated but never recorded.
- Realtime → "Ecommerce purchases" confirms the live path end to end.

## Not needed here

`svc_credentials/google_console_service_account.json` (`jinteat@jintea.iam.gserviceaccount.com`)
is a Google Cloud service account — Search Console / Admin API territory. GA4
Measurement Protocol authenticates with the API secret, and GTM/GA4 client tagging needs
no credentials at all, so nothing in this setup uses it. It is now gitignored.
