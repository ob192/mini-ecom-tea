# Handoff

**State as of 2026-10-21.** Earlier layers: 2026-08-20 (Merchant Center / SEO) and a
conversion investigation on 2026-09-07. Everything under "Live state" was verified by
probing the real site or its APIs on the date given and can go stale — re-check before
relying on it. The commits and decisions are durable.

---

## TL;DR

**Everything in this repo is deployed.** Production is `58f6b15`
(`dpl_4iMJBWXvEV2V1e8k5kGCKU9tqwWS`, 2026-10-20). That includes the four Merchant
Center / SEO commits, the Meta Conversions API, and the `/privacy` disclosure. The feed
Google fetches is the fixed one.

**Meta is fully wired as of 2026-10-20** — pixel `1480203177363951`, GTM container
version 10, and a server-side `Purchase`. Confirmed end to end against Meta's own stats;
see "Meta pixel" below.

**The shop still has no real orders.** That has not changed since 2026-09-07 and is the
only thing that matters. On 2026-10-20, a full day with the pixel live, Meta recorded
real traffic reaching checkout — `InitiateCheckout` 4 and 2 in two separate hours — and
exactly **one** `Purchase`, which was a test order placed from this project. Measurement
is now correct; the funnel is not. The site-side fixes are on `design/pencil-export` and
still not merged.

---

## Why nobody buys (investigated 2026-09-07, GA4 property 548000264)

90 days to 2026-09-07: 151 users, 180 sessions, 7 `purchase` events / 5 785 ₴ — all of
them desktop, on 31 Jul, 1 Aug and 18 Aug, from Chernihiv, one landing on
`/order/success?id=TC-000000`. They look like test orders; **confirm against Telegram
before treating any of that as revenue.**

The funnel split by device is the whole story:

| | sessions | users | view_item | add_to_cart | begin_checkout | purchase |
|---|---|---|---|---|---|---|
| mobile | 93 | 86 | 32 (18 users) | 3 (1 user) | 0 | 0 |
| desktop | 90 | 66 | 49 | 17 | 12 | 7 |

Google Ads (`Sales_Search`) sent 74 sessions / 71 users, 72 of them mobile, all landing
on `/?cat=oolong`. Three add-to-carts, no checkouts, no orders.

**Cause 1 — the cookie notice covered the buy button (fixed in the repo).** On a
375x812 phone the notice (`z-50`, fixed to the bottom) sat on top of the sticky buy bar
(`z-40`, `bottom: 12px`): 89% of «Додати в кошик» was not hit-testable and
`elementFromPoint` at the centre of the button returned «Добре». Every first-time mobile
visitor hit this, and every ad click is a first-time visitor. The same `.sticky-bar`
wraps the checkout submit button. Fixed by having the notice publish its height as
`--cookie-notice-h`, which the bar adds to its `bottom` and `body` reserves as
`padding-bottom`; pinned bar now clears the notice by 13px and every control is
hit-testable. Pinned by `tests/bottom-layers.test.ts`.

**Cause 2 — GA4 never received any item data (fixed live, container version 8,
2026-09-07).** The `GA4 — Ecommerce` tag (18) had *Send Ecommerce data* ticked but no
**Data source**: `sendEcommerceData:true` with neither `getEcommerceDataFrom` nor
`ecommerceMacroData`, so the `__gaawe` runtime attached nothing. Live `view_item` hits
carried no `pr1=` and no `cu`, and GA4 reported `itemsViewed` / `itemsAddedToCart` /
`itemsCheckedOut` as 0 for the whole catalogue — so Google Ads had no product-level or
add-to-cart signal for the entire Sales_Search run. Fixed by adding
`getEcommerceDataFrom: "dataLayer"` and publishing version 8; verified on the live site
(`pr1=idpuer/gongting-gongbing-shu~…~pr510~qt1`, `cu=UAH`, `epn.value=510`). **Item
metrics before this date are zero because of instrumentation, not behaviour.**

**Cause 3 — `/?cat=<slug>` stopped filtering (fixed in the repo).** That URL used to be
the catalogue; the redesign moved the grid to `/catalog` and the home page ignores the
parameter. `next.config.mjs` now 308s it to `/catalog?cat=<slug>`.

## Blocking — only a human can do these

1. **Deploy the conversion fixes** (branch `design/pencil-export`). Until they are live,
   the mobile buy button is still covered on the real site. This outranks everything
   below: no feed fix matters while the shop cannot take an order.

2. **Turn OFF GA4 Enhanced Measurement → "Page changes based on browser history
   events"** (property 548000264, stream 15359362854). Found 2026-09-07:
   `pageChangesEnabled` is `true`, which `docs/analytics.md` and `CLAUDE.md` both say
   must be off because the app pushes its own `page_view` on route changes. Measured on
   the live site: **one SPA navigation sends four identical `page_view` hits**. Every
   pageview, pages/session and engagement-rate figure in the property is inflated;
   app-pushed event counts (`add_to_cart`, `begin_checkout`, `purchase`) are not, so the
   funnel above still stands. A property setting, not a repo change.

3. **Look at the Default Workspace in GTM.** It holds `paused: true` on tag 17
   (`GA4 — page_view (SPA)`) while the live version has that tag active — and GTM's own
   `getStatus` reports the workspace as having **zero** pending changes, so the
   difference is invisible in the UI's change list. Publishing that workspace would
   silently stop SPA page-view tracking. Version 8 was deliberately built in a separate
   workspace (`ecommerce-data-source`) to avoid shipping it. Decide whether the pause was
   intended and either apply it deliberately or discard the workspace.

4. **Change the Google Ads final URL** for `Sales_Search` from `/?cat=oolong` to
   `/catalog?cat=oolong`. The repo now redirects the old URL so no click is lost, but a
   308 on every paid click is a wasted round trip. Re-import GA4 conversions into Ads
   once the ecommerce tick above is on.

5. **Deploy `main`.** Nothing below is live. Do this *before* the Merchant Center review
   finishes: `1009a5a` changes every `g:id` (`green/longjing-cha-25g` →
   `green-longjing-cha-25g`), and Merchant Center keys a product's history off its id.
   Renumbering is free before the first successful ingest and costs the entire
   performance history afterwards.

6. **Switch the feed's content language to Ukrainian in the Merchant Center UI.**
   Merchant Center reported the feed as English while all copy is Ukrainian. The feed now
   emits `<language>uk</language>`, but **that element cannot override the feed
   registration** — Google takes the language from the feed's settings. This is still
   unfixed and is not fixable from the repo.

7. **Decide what happens to `jintea.shop`.** It returned 404 `DEPLOYMENT_NOT_FOUND` on
   both apex and `www` as of 2026-08-20 — someone detached it from the Vercel project
   mid-session (earlier the same day it was serving the site). The 308 redirect committed
   in `next.config.mjs` **will not fire** until the domain is re-attached to the Vercel
   project, because Vercel 404s before the request reaches Next.js.

---

## Do not re-litigate: the MPN decision

`g:mpn` is published, `g:identifier_exists` is absent, `g:gtin` is absent. This flipped
twice in one session; the reasoning is in `docs/merchant-feed.md` and is load-bearing.

The short version: **reselling is only disqualifying when the item already carries
somebody else's brand.** This tea is bought direct from a producer in a Chinese village,
arrives unbranded, and is packaged and sold as Jintea. Google's own wording for `brand`
covers "products manufactured by someone else and rebranded by you" — private label,
where the merchant issues the part number.

- "We're a reseller, so we can't assign an MPN" is the plain-English reading and is
  **wrong** for this feed. It caused one revert already.
- A feed audit scoring "0/54 missing GTIN" is expected. A GTIN is a GS1 barcode; there
  isn't one, and fabricating one is a disapproval, not a fix.
- If sourcing ever changes to a supplier whose name is on the package, *their* brand and
  *their* MPN belong in the feed and ours do not.

---

## Shipped live on 2026-09-07 (outside the repo)

**GTM container `GTM-MKJP47L5`, version 8 — "Ecommerce data source = Data Layer".**
Tag 18 (`GA4 — Ecommerce`) gained `getEcommerceDataFrom: "dataLayer"`. Built in a fresh
workspace off live version 7 so the Default Workspace's stray tag-17 pause was not
shipped; tags 16, 17 and 19 are byte-identical to version 7. Rollback is republishing
version 7 from the GTM UI. The service account in `svc_credentials/` is an account admin
with `publish` on this container, so this is reachable over the Tag Manager API — that
also means an accidental publish is one API call away. Treat it accordingly.

## What shipped

| Commit | What |
|---|---|
| `748a7d0` | `g:brand` was the hostname → `BRAND_NAME` (`Jintea`), applied to feed, JSON-LD, wordmark, titles. Alias-domain 308 redirect. Product schema gained `priceValidUntil`, `shippingDetails`, `hasMerchantReturnPolicy`; added `WebSite` + `ItemList` JSON-LD. Collapsed the triplicated delivery constants into `lib/shipping.ts`. |
| `1009a5a` | `title`/`link`/`description` were emitted as `g:title`/`g:link`/`g:description`. They are RSS 2.0's **own** predefined elements and must be unprefixed — a validator read all three as missing on all 54 offers. Also flattened `/` out of `g:id` / `g:item_group_id`. |
| `b1ca088` | Merchant-assigned `g:mpn`, dropped `g:identifier_exists`. |
| `35e2d19` | Docs only — why the MPN is legitimate here. |

87 tests pass, typecheck clean, build clean, 54 offers.

---

## Live state (verified 2026-08-20 — re-check)

- `jintea.restreto-labs.com` — 200, primary, behind **Cloudflare** → Vercel.
- `jintea.shop` / `www.jintea.shop` — **404 `DEPLOYMENT_NOT_FOUND`**, direct to Vercel,
  not proxied by Cloudflare. DNS is fine (apex A `216.198.79.1`, www CNAME to
  `vercel-dns-017.com`); the domain is simply not attached to a Vercel project.
  A CNAME cannot produce a redirect — DNS has no HTTP semantics. Either re-attach and let
  `next.config.mjs` 308 it, or use Vercel's own Domains → *Redirect to* setting.
- GTM `GTM-MKJP47L5` is in the served HTML; the published container carries GA4
  `G-5PCX5S995S` and triggers for every event the site pushes, plus a `localhost` blocker.
- `/google-merchant.xml` — 200, 54 offers.
- Policy pages `/delivery`, `/returns`, `/privacy`, `/contacts`, `/about` — all 200.

---

## Not set up

- **Google Ads — partly corrected 2026-10-20.** The claim "no `AW-` anywhere" was true of
  the repo and the GTM container, and is still true of both. But the live site *does* talk
  to Google Ads account **`18362523479`**: reading resource timing on a product page shows
  `googleads.g.doubleclick.net/pagead/viewthroughconversion/18362523479/`,
  `google.com/rmkt/collect/18362523479/` and `pagead/1p-user-list/18362523479/`. Those come
  from the Google tag's **linked destinations**, configured in the Google/GA4 UI rather
  than in GTM, which is why grepping the repo and the container found nothing. So
  remarketing and audiences are flowing; **conversion import is still the open piece.**
  Because `purchase` is server-side only (`app/api/order/route.ts` via the Measurement
  Protocol), the route in remains **link GA4 → Google Ads and import `purchase`**, not a
  client-side Ads conversion tag — there is no client event to hang one on.
- ~~**`GA4_API_SECRET` in production is unverified.**~~ **Resolved 2026-10-20.** Read via
  the Vercel API: `GA4_API_SECRET` is set on Production and Preview, and `GA4_MP_DEBUG` is
  present but set to **`0`** — `lib/ga4-server.ts` tests `=== '1'`, so debug mode is off and
  purchases are recorded normally. Note the convention this establishes: flags here are
  switched off **by value, not by absence**. `lib/meta-capi.ts` treats `"0"` as off for
  `META_CAPI_TEST_EVENT_CODE` for exactly that reason; anything new reading an env flag
  should do the same, or a `"0"` will read as "on".
- **No legal entity details** (ФОП/ЄДРПОУ, registered address) are published. Deliberate,
  but the most likely remaining Misrepresentation trigger once ad spend starts.

---

## Meta pixel + Conversions API (2026-10-19 → 2026-10-20)

Dataset / pixel `1480203177363951` ("JinTea"), business `757878937371527`
(Oleksandr Bunin FOP). Full reference: `docs/analytics.md`. The short version of what
happened and what it cost, because two of these were traps rather than tasks:

**It works, confirmed against Meta's own numbers.** 2026-10-20, 02:00 PDT bucket:
`PageView` 15, `ViewContent` 2, `AddToCart` 2, `InitiateCheckout` 2, **`Purchase` 1** —
that last one is order `TC-981360`, 620 ₴, placed as a live test from this project. The
whole chain is proven: browser pixel → GTM → server-side CAPI → Meta.

**Trap 1 — the wizard's container inflated GA4.** Connecting the pixel from Events
Manager published container **version 9** by itself, adding tags 36 and 37 alongside the
pixel. Tag 36 was a *second* `googtag` config for `G-5PCX5S995S` with
`send_page_view: true`; tag 37 duplicated every event. Measured: one product-page load
produced `page_view` ×3, `view_item` ×2 and a junk `gtm.dom` event. **GA4 numbers between
roughly 10:00 and 21:00 UTC on 2026-10-19 are inflated** — discount them. Version 10
pauses both tags. They cost nothing to lose: that pair is Meta's CAPI-via-GA4 transport,
which is inert here (`gateway_status: NOT_ONBOARDED`, `transport_url` empty).

**Trap 2 — `purchase` can never fire from the browser.** The container maps a dataLayer
`purchase` to Meta's `Purchase`, but this site never pushes one (see `lib/analytics.ts`).
So the mapping was wired to an event that cannot arrive, and Meta would have had the whole
funnel and zero conversions forever. `lib/meta-capi.ts` closes it server-side. **Do not
"fix" this by adding a client-side purchase push.**

**Trap 3 — flags are switched off by value here.** `GA4_MP_DEBUG` is `"0"` in production,
not absent. `lib/ga4-server.ts` tests `=== '1'`, so that is safe, but any new env flag read
with a truthiness check would read `"0"` as ON. `META_CAPI_TEST_EVENT_CODE` had exactly
that bug and was fixed in `a2e9bfd`; a stray value there sends every `Purchase` to the Test
Events tab, where Meta validates it and never records it.

### Open, and only a human can do these

- **GA4 Enhanced Measurement is probably double-counting SPA views.** One client-side
  navigation produced **three** `page_view` hits to `G-5PCX5S995S` (document loads are
  clean at one). `PageViewTracker` + tag 17 already send the SPA view, so
  **GA4 → Admin → Data streams → Enhanced measurement → "page changes based on browser
  history events" must be OFF.** This was measured on version 10 and not before it, so it
  is not attributable to the container change. No container edit fixes it.
- **`META_CAPI_ACCESS_TOKEN` is stored as type `encrypted`, not `sensitive`.** Vercel
  itself flags it `securityIssues: ["readable-secret"]` — the value can be read back
  through the dashboard or API. Switch it to Sensitive. (A first token was pasted into a
  chat transcript on 2026-10-20 and rotated; this is the replacement.)
- **Advanced matching is OFF and should stay off until decided.**
  `META_CAPI_ADVANCED_MATCHING=1` would send the customer's SHA-256 phone to Meta.
  `/privacy` §11.4 currently states in writing that no such data is sent, so enabling it
  means editing that section in the same change.
- **`/privacy` still says nothing about GA4/GTM or cookies generally**, although the cookie
  notice links to it. Predates all of the above; Meta is documented, Google is not.

---

## Credentials

`svc_credentials/google_console_service_account.json` (gitignored) —
`jinteat@jintea.iam.gserviceaccount.com`, project `jintea`. **Nothing in this stack uses
it**: GA4 Measurement Protocol authenticates with `GA4_API_SECRET`, GTM/GA4 client tagging
needs no credentials, and the feed is fetched as a public URL. It would only matter for
Search Console or the Content API — and for the latter it must first be added as a user in
Merchant Center, which it is not.

---

## Repo hygiene — needs a decision

`b1ca088` **accidentally committed two files that were staged before the session started**:

- `cc.html` — 0 bytes, and deleted from the working tree. Almost certainly should not be
  tracked.
- `context-config.json` — committed at the older staged version; the working tree has a
  newer, shorter one (uncommitted).

Cause: `git commit` commits the whole index, and these had been restored into the index by
an earlier `git update-index` call. Neither is referenced by the app. Decide whether to
untrack `cc.html` and commit or discard the newer `context-config.json`.

`.claude/launch.json` is untracked — it is the dev-server config that makes
`preview_start` work by name. Worth committing.

---

## Verifying a feed change

```bash
npm test && npm run typecheck && npm run build
```

Never run `npm run build` while `npm run dev` is live — both write `.next` and the
resulting corruption looks like application errors. `rm -rf .next` if that happens.

Inspect the built feed without starting a server:

```bash
grep -c '<item>' .next/server/app/google-merchant.xml.body
```

Background reading, in order of usefulness: `docs/merchant-feed.md`, `docs/analytics.md`,
`CLAUDE.md`.
