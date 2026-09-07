# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

> `HANDOFF.md` carries the current session-to-session state: what is committed but not
> yet deployed, what only a human can do in the Google consoles, and decisions that were
> reverted once and should not be reverted again. Check its date — the live-state facts
> in it go stale; this file does not.

jintea.restreto-labs.com — a mobile-first, SEO-optimized Ukrainian leaf-tea storefront. Next.js 15 (App Router) + TypeScript + Tailwind. No database, no online payment: orders are validated and priced server-side, then pushed to a Telegram chat via the Bot API; the customer pays on delivery. All UI copy is Ukrainian.

## Commands

```bash
npm run dev        # dev server (http://localhost:3000)
npm run build      # production build
npm run start      # run the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
npm test           # vitest run
npm run test:watch # vitest
```

Tests live in `tests/` (Vitest, node environment, `@/` alias mirrored from tsconfig in
`vitest.config.ts`). They cover the revenue path rather than the UI:

- `tests/order-api.test.ts` calls the `POST` handler of `app/api/order/route.ts` directly
  with `fetch` stubbed, so Telegram and GA4 are captured instead of sent. Two production
  incidents are pinned here as regressions: the honeypot silently discarding real orders
  (browsers autofilled the field when it was named `company`), and a rejection helper that
  recursed and returned 500s. Each request uses a unique `x-forwarded-for` so the 5/min
  rate limiter doesn't interfere.
- `tests/pricing.test.ts` covers tier resolution, `collapseToTier` never producing a more
  expensive basket, catalogue integrity, and UA phone validation.
- `tests/analytics.test.ts` covers `_ga` cookie parsing (both GA4 cookie formats), GA4 item
  mapping, and the mandatory `{ ecommerce: null }` reset before each ecommerce push.
- `tests/design-tokens.test.ts` pins the three copies of every design token
  (TypeScript, CSS custom properties, Tailwind scales) against each other, since
  nothing syncs them; it also guards the near-square radius rule.
- `tests/merchant-feed.test.ts` covers the Google Merchant Center feed: required attributes,
  GMC length limits, variant grouping, and the exclusion list (a product silently dropping
  out of the feed is otherwise invisible).

Required env vars — all listed in `.env.example`: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NEXT_PUBLIC_SITE_URL`, `NOVA_POSHTA_API_KEY` (server-side; without it the NP city/warehouse lookups 500), plus the analytics vars described in `docs/analytics.md`.

## Data model: `public/products.json`

This is the single source of truth for the catalog. `lib/products.ts` reads it and normalizes each raw entry into the `Product` shape (`lib/types.ts`) at build/import time — there is no runtime DB.

- A product's **category is derived from its slug prefix**, not a separate field: `"green/longjing-cha"` → category `green`. There is no validation that the prefix is a known category; it just falls through.
- The fixed category list (order + Ukrainian labels) lives in `CATEGORY_ORDER` in `lib/products.ts`, and the allowed slugs are separately typed as `CategorySlug` in `lib/types.ts`. Adding a category means updating both, plus a `CAT_TONE` entry for the placeholder gradient. Teas are `puer`/`green`/`oolong`/`red`/`white`; the rest of the catalogue is `set`, `gaiwan`, `teapot`, `piala`, `accessory`, `figurine`.
- Products can have a single `price`/`weight`, or a `priceTiers: {weight, price}[]` list (e.g. 25 г / 50 г / 100 г options). `priceFor(product, weight)` resolves the price for a chosen tier; with tiers present, only exact weight matches resolve — everything else is `null` ("unavailable").
- `inStock` is derived (`price != null`), not an authored field.
- `description` is **newline-separated**: one line per source paragraph or bullet (bullets start with `• `). Render it with `descriptionParagraphs()` from `lib/format.ts`; anything that needs one line (meta description, JSON-LD) uses `flattenDescription()`. `parse_docx.py` trims it to ~1100 characters on paragraph boundaries, so the copy never ends mid-thought.
- Each product's images live under `public/<slug>/` (e.g. `public/green/longjing-cha/1.jpg`); `files: string[]` in the JSON lists filenames, and `lib/products.ts` resolves them to `/​<slug>/<file>` public paths.
- `images/` at the repo root (untracked) holds the ingestion tooling (`parse_docx.py`, `reorg.sh`) used to turn supplier `.docx` product sheets + photos into `public/products.json` entries and `public/<slug>/` image folders. It's not part of the running app. To add a product: drop the supplier folder in `images/`, register it with `add <slug> <folder> <fallback title> [title override]` in `reorg.sh` (plus `sub <slug> <subtitle>` when the parsed subtitle is a bare section heading), run `bash images/reorg.sh`, then copy `images/.new/*` into `public/`. Regenerating rewrites the **whole** catalogue, so diff `images/.new/products.json` against `public/products.json` before copying.
- **`description` and `subtitle` are hand-written and no longer come from the parser.** Every description was rewritten to be short and factual — origin, cultivar, processing, tasting notes, materials — instead of the parser's long philosophical copy, which also arrived with commas stripped and "китійський" misspelled throughout. A full regeneration will hand back the original supplier prose and silently undo all 44. When regenerating, take the new products/images from `images/.new/` but keep the existing `description` and `subtitle` for products that already have one.

## Routing

- `/` — home (`app/page.tsx`). Follows the `Home Page` frame in jintea.pen section for
  section: hero, the `ProductRail` («Оберіть свій чай»), the discover banner, the journal
  teaser, the Instagram band. **It is no longer the catalogue** — it shows one curated rail
  and links onward.
- `/catalog` — the full, filterable catalogue (`CatalogGrid`), statically generated. This is
  where the `?cat=` links in the header, footer and product breadcrumbs point, and where the
  `ItemList` JSON-LD lives. It moved off `/` with the design; both are in the sitemap.
- `/journal`, `/journal/[slug]` — Журнал. Articles are authored in `lib/journal.ts` (no CMS,
  same shape as the catalogue); `body` is newline-separated like a product `description`, so
  `descriptionParagraphs()` renders both. **The three articles are a first draft written from
  general tea knowledge and have not been reviewed** — read them before publishing.
- `/product/[...slug]` — **catch-all** route (`app/product/[...slug]/page.tsx`), because product slugs are multi-segment (`category/product-name`). `generateStaticParams` splits `Product.slug` on `/`.
- `/cart`, `/checkout`, `/order/success` — client cart flow.
- `/about`, `/brewing`, `/contacts`, `/delivery`, `/returns`, `/privacy` — static informational
  pages. `/delivery` (Оплата і доставка), `/returns` (Обмін та повернення) and `/privacy`
  (Угода користувача — the personal-data policy) are the policy pages Merchant Center requires
  to be visible; all three are linked from the footer and from under the checkout submit button.
  Contact details for all of them come from `lib/contacts.ts` — author them there, not inline,
  because Merchant Center checks that they agree across the site and the Organization JSON-LD.
  So does the shop's name: `BRAND_NAME` (`Jintea`) is the wordmark, every page title, the
  Organization and `Brand` JSON-LD, and the feed's `g:brand`. **It is a brand, not a domain** —
  it once held the bare host, which made `g:brand` a URL and left brand searches unmatchable.
  Domains belong in `NEXT_PUBLIC_SITE_URL` via `siteUrl()`; never write one into copy.
- `app/api/order/route.ts` — order submission → Telegram.
- `app/api/np/cities`, `app/api/np/warehouses` — Nova Poshta lookups (see below).
- `/google-merchant.xml` — Google Merchant Center product feed (see below).

**One host, not three.** `jintea.shop` and `www.jintea.shop` are aliases of the same Vercel
deployment and used to serve byte-identical 200s alongside the primary host, which split GA4
(`page_location` carries the hostname) and gave Google a second crawlable copy of every URL.
`redirects()` in `next.config.mjs` now 308s every alias onto the host in `NEXT_PUBLIC_SITE_URL`;
the primary host is filtered out of that list, so changing the variable moves the redirect
instead of creating a loop. Adding a domain means adding it to `ALIAS_HOSTS`, not just to Vercel.

## Cart

`context/CartContext.tsx` is a React Context + `useReducer`, persisted to `localStorage` under `teache_cart_v2` (the version suffix was bumped when the line-item shape changed to include `weight` — bump it again if the persisted shape changes). Cart lines are keyed by `(slug, weight)`, not just `slug`, since the same product can be added at different weight tiers. On hydration, stale/invalid lines (unknown slug, price no longer resolvable for that weight) are silently dropped.

`FREE_DELIVERY_THRESHOLD` (500) and `DELIVERY_FEE` (100) live in `lib/shipping.ts`, imported by `context/CartContext.tsx` (client-side display), `app/api/order/route.ts` (authoritative, server-side total), `lib/merchant-feed.ts` (`g:shipping`) and `components/JsonLd.tsx` (`shippingDetails`). They used to be copy-pasted into each. What still cannot be imported is the **prose**: `app/delivery/page.tsx` (the meta description and two delivery cards) and the free-delivery banner in `components/CatalogGrid.tsx` state both numbers as sentences, and Google Merchant Center compares the feed's `g:shipping` against what those pages say — so a change to the constants means editing that copy by hand. `tests/pricing.test.ts` pins the pair and checks the feed agrees, which is what catches a half-done change.

## Checkout, delivery, and the order API

Delivery is Nova Poshta only, either to a branch/postomat (`np_warehouse`, needs a warehouse) or by courier to a street address (`np_courier`). `lib/checkout-schema.ts` (Zod) validates the form client-side via `react-hook-form`; `app/api/order/route.ts` re-validates everything server-side and **never trusts client-submitted prices or totals** — it recomputes line items and the total from `public/products.json` via `getProduct`/`priceFor`.

- `lib/nova-poshta.ts` is a server-only client (`NOVA_POSHTA_API_KEY` never reaches the browser); all NP traffic is proxied through `app/api/np/cities` and `app/api/np/warehouses`, which apply a much looser rate limit (60/min) than order submission, plus a 30-minute in-process cache keyed by query (and by city for warehouses).
- `app/api/order/route.ts` has a honeypot field (`company`): if filled, it returns a fake success without sending anything, to silently drop bot submissions.
- `lib/rate-limit.ts` is an in-memory fixed-window limiter stored on `globalThis` (survives HMR in dev). It is **per-process**, not shared across serverless instances — fine as a basic guard, not a hard limit in a multi-instance deployment.

## Analytics

GTM (`GTM-MKJP47L5`) + GA4 (`G-5PCX5S995S`). Full setup and the GTM container recipe:
`docs/analytics.md`.

- Client code never calls Google — it pushes to the `dataLayer` through the helpers in
  `lib/analytics.ts` (`trackViewItem`, `trackAddToCart`, …). Add new events there, not inline.
- Ecommerce pushes must reset with `{ ecommerce: null }` first; `pushEcommerce` does that.
- The GTM snippet lives in `components/Analytics.tsx`; it renders nothing when
  `NEXT_PUBLIC_GTM_ID` is unset, which is how tracking is disabled for dev/previews.
- SPA `page_view` is pushed manually by `PageViewTracker` (App Router navigations don't
  reload the document). GA4 Enhanced Measurement's "page changes based on browser history
  events" must stay OFF or every navigation is counted twice.
- `purchase` is the exception: sent server-side from `app/api/order/route.ts` via the
  Measurement Protocol (`lib/ga4-server.ts`), using the recomputed total and the visitor's
  `_ga` cookies. Never add a client-side `purchase` — it would double count.

## Google Merchant Center feed

`/google-merchant.xml` (`app/google-merchant.xml/route.ts` → `lib/merchant-feed.ts`) is a
statically prerendered RSS 2.0 feed. Full reference: `docs/merchant-feed.md`.

- **Weight tiers become variants**: one offer per tier, grouped by `g:item_group_id` and
  differentiated by `g:size`. The feed `g:id` comes from `offerId()`, which
  `components/JsonLd.tsx` also uses as the per-tier schema.org `sku` — Google compares the
  crawled landing page against the feed, so publishing only the base "від ..." price there
  reads as a price mismatch on every larger tier.
- No GTIN exists (unbranded leaf tea has no GS1 barcode) and none may be fabricated, but `g:mpn`
  is published and `g:identifier_exists` is absent. The tea is bought direct from a Chinese village
  producer, arrives **unbranded**, and is sold as Jintea — Google's own wording for `brand` covers
  "products manufactured by someone else and rebranded by you", i.e. private label, where the
  merchant issues the part number. Reselling is only disqualifying when the item already carries
  someone else's brand. Read `docs/merchant-feed.md` before changing this; it has flipped once.
- `FREE_DELIVERY_THRESHOLD` / `DELIVERY_FEE` are imported from `lib/shipping.ts` to compute
  `g:shipping`, so the feed cannot drift from the cart or the order API.
- **Tea only.** `ADVERTISED_CATEGORIES` limits the feed to `puer`/`green`/`oolong`/`red`/
  `white`; teaware, sets and figurines stay in the storefront but are not advertised. Add a
  slug to that set to bring a category back.
- Products with no price or no photo are excluded too — `g:image_link` is required and the
  placeholder gradient isn't a product photo. `feedDefects()` separates those (a problem)
  from the category exclusions (intended); the route logs a count and names only the defects.

## UI / design system

The design is exported from **`/home/bunin192/Apps/Pencil/jintea.pen`** (Pencil
MCP). `design/README.md` is the reference; read it before restyling anything.

- `design/tokens/*.ts` is the source of truth for tokens; `design/tokens/tokens.css`
  is its CSS twin (and carries the shadcn bridge); `tailwind.config.ts` is the
  utility surface. All three must agree — `tests/design-tokens.test.ts` fails if
  they don't. Change the `.pen` file first, then all three.
- `design/primitives/*` are the reusable controls, one module per panel of the
  file's `Design System — Components` frame (Button, IconButton, TextLink, Tag,
  Eyebrow, WeightChip, QtyStepper, InfoRow, Accordion, SectionHeading,
  Breadcrumb, Panel, Field). Screens compose these; if a screen needs a control
  that isn't there, draw it in the design file first.
- `components/ui/*` are shadcn/ui components (`components.json`: style `new-york`,
  base color `stone`, `cssVariables: true`). `button`, `input` and `badge` are now
  thin re-exports of the design primitives, so the shadcn import paths keep working;
  `card` is the design's `Panel` surface with shadcn's parts.
- **The home hero's video is a layer over the still, not a replacement.**
  `components/HeroVideo.tsx` ships with `preload="none"` and no `<source>` in the
  markup, so the server-rendered HTML carries no video URL at all; a client effect
  attaches sources only after checking `prefers-reduced-motion`, `connection.saveData`
  and `effectiveType`, then fades the clip in over the poster. Anyone excluded — or
  with JS off, or refused autoplay — downloads zero video bytes and still sees a
  finished hero, and the LCP element stays the next/image poster. Renditions live in
  `public/video/` (720p for phones, 1080p above 768px, VP9 first with an H.264 twin);
  the 4K master is in `/media`, which is gitignored, because anything under `public/`
  ships to every deploy and is fetchable. The ffmpeg commands are in the component.
- **`<Header back>` needs a `backHref`.** «Назад» is a real link to the page's parent,
  not `router.back()`: history-back dead-ended on any direct landing (a pasted URL, a new
  tab, an ad or search result pointing at a product) and, when there *was* a previous
  entry, it was usually Google — no API distinguishes that from one of our own pages, so
  back would have returned paid traffic to the auction. The default `/` is a floor, not
  an answer; a product's parent is `/catalog?cat=<category>`, which must match the page's
  `BreadcrumbList` JSON-LD. `tests/back-navigation.test.ts` pins both.
- **Bottom-anchored layers share `--cookie-notice-h`.** `components/CookieConsent.tsx`
  publishes the notice's height there while it is on screen; `.sticky-bar` (the mobile
  buy bar and the checkout submit) adds it to its `bottom` and `body` reserves it as
  `padding-bottom`. Without that handshake the notice — correctly the higher layer —
  covered «Додати в кошик» outright on every first mobile visit, which is every ad
  click. Anything else pinned to the bottom of the viewport must join the handshake, not
  just pick a z-index. `tests/bottom-layers.test.ts` fails if either half goes missing.
- The design separates surfaces with **hairlines, not shadows** (`shadow-hairline`);
  `shadow-overlay` and `shadow-up` are the only real shadows. Corners are near-square:
  `rounded-lg` is 6px, not 22px.
- Content is held by `mx-auto max-w-content px-5 lg:px-8` inside full-bleed sections.
  Such a section must not sit directly in a `flex flex-col` parent — an auto
  cross-axis margin on a flex item shrinks it to its content, which silently
  collapsed every catalogue section once already.
- Fonts: Oswald (display) + PT Sans (body), loaded with Cyrillic subsets in `app/layout.tsx`.
  Display face is for headings, prices and the wordmark only; button labels are
  body-face, 13/700, uppercase.
- Layout is mobile-first, with `lg:` breakpoints for desktop (see
  `app/product/[...slug]/page.tsx`: single column on mobile, two-column grid on `lg:`).
  The shell is full-width — the previous design's centred phone-width column with a
  drop shadow is gone, because the hero and footer are full-bleed.
- SEO: per-page `generateMetadata`, JSON-LD via `components/JsonLd.tsx` (Product, BreadcrumbList, Organization), `app/sitemap.ts`, `app/robots.ts`.
- Every absolute URL (canonical, OG, JSON-LD, sitemap, robots) comes from `siteUrl()` in
  `lib/format.ts` → `NEXT_PUBLIC_SITE_URL`. Never hardcode the domain; for metadata,
  prefer relative paths — `metadataBase` in `app/layout.tsx` resolves them.
- `app/opengraph-image.tsx` generates the default 1200×630 social card at build time
  (`next/og`), using the bundled `app/og/Oswald-SemiBold.ttf` — satori can't read woff2,
  and the site's `next/font` files aren't reachable from the route. It covers every page
  that doesn't set `openGraph.images` itself; product pages still use their own photo.
