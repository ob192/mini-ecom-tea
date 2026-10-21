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
   Event Name `{{Event}}`, tick **Send Ecommerce data** *and* set the **Data
   source** selector that appears underneath it to **Data Layer**. Both, not
   just the tick — see the note below.
   Trigger: *Custom Event*, "use regex matching":
   `^(view_item_list|select_item|view_item|add_to_cart|remove_from_cart|view_cart|begin_checkout|add_shipping_info)$`

   > **Why the Data source matters — an incident, fixed 2026-09-07 (container
   > version 8).** Ticking *Send Ecommerce data* is only half of it. The
   > `__gaawe` runtime branches on a separate key: `getEcommerceDataFrom ===
   > 'dataLayer'` reads the event model, anything else reads the variable named
   > in `ecommerceMacroData`. Live version 7 had `sendEcommerceData:true` and
   > **neither** key, so it took the second branch and attached nothing.
   >
   > The symptom was silent: the site pushed a correct `items[]`, the tag fired,
   > and the hit reaching GA4 carried `en=view_item` with no `pr1=` and no `cu`.
   > GA4 reported `itemsViewed`, `itemsAddedToCart` and `itemsCheckedOut` as
   > **0** for the whole catalogue over 90 days and `itemListName` as empty,
   > while the server-side `purchase` — which does not go through GTM — was the
   > only source of item data in the property. Google Ads had no product-level
   > or add-to-cart signal to optimise against for the entire Sales_Search run.
   >
   > Verified fixed on the live site: `pr1=idpuer/gongting-gongbing-shu~nm…~va50
   > г~pr510~qt1`, `cu=UAH`, `epn.value=510`. **Item metrics before 2026-09-07
   > are zero for reasons of instrumentation, not behaviour — do not read them
   > as "nobody looked at the products".**

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

  > **Still ON as of 2026-09-07** (`pageChangesEnabled: true` on stream
  > `15359362854`). Measured on the live site by intercepting the hits: **one
  > SPA navigation sends four identical `page_view` hits** to GA4, same `dl`,
  > same session. Pageview counts, pages/session and engagement rate are all
  > inflated by roughly that factor — 891 `page_view` events across 180 sessions
  > in the 90 days to 2026-09-07 is instrumentation, not reading. Event counts
  > that are pushed once by the app (`add_to_cart`, `begin_checkout`,
  > `purchase`) are unaffected, so the conversion funnel in `HANDOFF.md` still
  > stands. Fixing it is a property setting, not a repo change.
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

## Meta pixel / Conversions API

Pixel (dataset) `1480203177363951` — "JinTea", business `757878937371527`
(Oleksandr Bunin FOP). Connected **2026-10-19** from Events Manager's GTM
integration, which published **container version 9** by itself.

### Where it lives: GTM, not this repo

Unlike GA4, the Meta pixel has **no code in this repository and no env var for
the browser half**. Meta's wizard installed, into the live container:

| Id | What |
|---|---|
| tag 36 | `…-Web-Tag-GA4_Config` — a second `googtag` for `G-5PCX5S995S`, DOM-Ready, `send_page_view: true` |
| tag 37 | `…-Web-Tag-GA4_Event` — a `gaawe` tag carrying `user_data`, `x-fb-ck-fbp`/`-fbc` |
| tag 39 | `…-Web-Tag-Pixel_Template` — the actual Meta pixel template, `useGA4Ecommerce: true` |
| trigger 23 | DOM Ready |
| trigger 24 | every custom event whose name does not contain `gtm.` |
| variables 25–35 | pixel id, event-name lookup, `_fbp`/`_fbc` cookies, ecommerce fields |

It reuses our existing GA4 ecommerce dataLayer rather than needing its own
pushes, so `lib/analytics.ts` did not change and does not need to.

Verified firing on the live site on 2026-10-19 by hooking `window.fbq`:
`trackSingle 1480203177363951 AddToCart` and `… PageView` both observed, and
`_fbp` is set. (Events Manager read "Never received event" at the time simply
because the container had been published minutes earlier with no traffic since.)

### `Purchase` is server-side, and has to be

Tag 39's event-name lookup (variable 35) maps GA4 names to Meta's standard set:

```
view_item      → ViewContent      page_view  → PageView
add_to_cart    → AddToCart        gtm.dom    → PageView
begin_checkout → InitiateCheckout purchase   → Purchase
```

**That last row is wired to an event this site never pushes.** `purchase` is
server-side only — see "Why `purchase` is server-side" above — so GTM alone
gives Meta the whole funnel and no conversions. `lib/meta-capi.ts` closes it,
posting `Purchase` to the Graph API from `app/api/order/route.ts` beside the
GA4 Measurement Protocol call, with the same recomputed total.

- `event_id` is the order id, so a browser-side `Purchase` would dedupe against
  it. Don't add one anyway — the reasons in `lib/analytics.ts` still apply.
- `content_ids` are **product slugs**, matching the `item_id` the browser events
  already send. The Google feed uses `offerId()` (`puer-…-25g`) instead, on
  purpose. If a Meta catalogue is ever created, both sides must move together.
- `_fbp` / `_fbc` are read off the order request's `Cookie` header, plus the
  client IP and user agent. `_fbc` is legitimately absent for organic visitors.
- A honeypot-flagged order still reports a Purchase, because the honeypot flags
  rather than drops (`route.ts:76`) — consistent with the GA4 purchase.
- Never throws, 3s timeout: analytics cannot fail an accepted order.

Advanced matching (hashed phone in `user_data.ph`) is **off** unless
`META_CAPI_ADVANCED_MATCHING=1`. It improves attribution but sends customer
data to Meta, so it needs a line on `/privacy` first — a disclosure decision,
not a default. `tests/meta-capi.test.ts` pins that the raw number never appears
in the payload either way.

### Container version 10 — what was wrong and what was done

Meta's wizard published version 9 by itself on 2026-10-19. Three things in it
were wrong; version 10 (published 2026-10-19) fixes all three.

**1. Tags 36 and 37 were inflating GA4 and giving Meta nothing — now paused.**
Measured on one product-page load under version 9, hits to `G-5PCX5S995S`:

| event | v9 | should be | v10 |
|---|---|---|---|
| `page_view` | 3 | 1 | **1** |
| `view_item` | 2 | 1 | **1** |
| `gtm.dom` | 1 | 0 | **0** |

Tag 36 was a *second* `googtag` config for the same measurement ID with
`send_page_view: true` on DOM Ready, alongside tag 16 on Initialization; tag 37
was a `gaawe` tag firing on both triggers with `eventName: {{Event}}`, which
duplicated every event and sent `gtm.dom` to GA4 as an event name. GA4 data
between ~10:00 and ~21:00 on 2026-10-19 is inflated accordingly.

They cost nothing to pause: that pair implements Meta's CAPI-via-GA4 transport,
which is **inert here** — `gateway_status` is `NOT_ONBOARDED` and tag 36's
`transport_url` is empty, so nothing was being routed to Meta through it. Every
Meta event comes from tag 39. If the first-party CAPI gateway is ever onboarded,
un-pause them *and* re-check the GA4 counts above.

**2. Tag 39 had no blocking trigger — now blocked on 11 + 12.** Every GA4 tag is
blocked on `localhost|\.vercel\.app$`; the pixel was not, so dev and preview
traffic landed in the real dataset. (Some of the 2026-10-19 events are exactly
that, from this work.)

**3. Trigger 24 matched every non-`gtm.` event — now narrowed** to
`^(view_item|add_to_cart|begin_checkout|purchase)$`, the events variable 35
actually maps. Under version 9 everything else fell through to the default
(`{{Event}}`) and reached Meta as a *custom* event: in one hour,
`gtag.config` 24, `spa_page_view` 12, `view_item_list` 10, `form_start` 8,
`scroll` 6, `form_submit` 4, `view_cart` 4, `add_shipping_info` 2,
`select_item` 2 — 72 of 120 events were noise. Verified after publishing: an
add-to-cart now produces exactly one `trackSingle … AddToCart` and nothing else.

`purchase` is in that regex for safety; the site still does not push one, and
should not — `lib/meta-capi.ts` sends it server-side.

### Confirmed working (2026-10-20)

End to end, against Meta's own dataset stats rather than browser-side inference — the
distinction matters, because `fbq()` being *called* and an event being *received* are not
the same thing, and resource timing cannot see `navigator.sendBeacon`, which is how
fbevents ships. The 02:00 PDT bucket:

| event | count |
|---|---|
| PageView | 15 |
| ViewContent | 2 |
| AddToCart | 2 |
| InitiateCheckout | 2 |
| **Purchase** | **1** |

That `Purchase` is order `TC-981360` (620 ₴), placed as a live test. The Vercel logs for
the same request show the route completing with no `[meta]` line between "Telegram
accepted" and "OK" — and `lib/meta-capi.ts` logs on any non-2xx, any throw and the 3 s
timeout, so silence there is success.

Note the aggregation rule that makes this confusing to check: **an hourly bucket only
publishes after the hour closes.** An order at 02:04 is invisible until after 03:00. A
dataset that looks empty is usually a date range that excludes today plus a bucket that
has not closed — that is exactly what the "Never received event" panic on 2026-10-19 was.

Across all of 2026-10-20 the dataset contains **no** unmapped custom events — no
`gtag.config`, no `spa_page_view`, no `scroll`. Compare 2026-10-19 under version 9, where
72 of 120 events were noise. The trigger-24 narrowing holds.

### Open — not yet resolved

- **SPA navigation fires three GA4 `page_view` hits.** Measured on v10: one client-side
  navigation to `/cart` produced `page_view` ×3, all `tid=G-5PCX5S995S`. Document loads
  are clean at one, so this is separate from the tag 36/37 problem, and it was not
  measured before the publish, so it is not attributable to it. Almost certainly GA4
  Enhanced Measurement's "page changes based on browser history events" being ON, which
  this file has always said must be OFF since tag 17 already sends the SPA `page_view`.
  **GA4 → Admin → Data streams → Enhanced measurement.** No container change fixes it.
- **Meta `PageView` on SPA navigation: still not isolated, but no sign of loss.** A
  `window.fbq` hook cannot observe fbevents' own pushState tracking, so the original test
  was incapable of answering this. Circumstantially, `PageView` volume across 2026-10-20
  stayed well above the `ViewContent` count (33 vs 10 in one hour, 30 vs 0 in another),
  which is the shape of SPA views being counted rather than document loads alone — but
  that is inference, not proof. If it ever needs settling, the fix if they *are* missing
  is to add `spa_page_view` to trigger 24 **and** map it to `PageView` in variable 35;
  adding it to the trigger alone brings it back as a custom event.

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
