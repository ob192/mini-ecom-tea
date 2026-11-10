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
- `app/api/order/route.ts` has a honeypot field (`botField` — deliberately *not* named
  `company`, which browsers autofilled): if filled, the order is **flagged, not dropped**.
  It still reaches Telegram, with a warning banner, and still reports `purchase` to GA4 and
  Meta. Dropping silently is what ate real orders once; see `lib/checkout-schema.ts`.
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

## Meta pixel

Pixel `1480203177363951`. The **browser** half lives entirely in the GTM container
(tag 39, container version 10, 2026-10-19) and reuses our GA4 ecommerce dataLayer — there is no pixel code in this repo and no public env var.
`Purchase` is the exception and must be server-side: GTM maps a dataLayer `purchase` to
Meta's `Purchase`, but this site never pushes one, so `lib/meta-capi.ts` posts it from
the order route beside the GA4 call, keyed `event_id = orderId` for dedup. Hashed-phone
advanced matching is opt-in via `META_CAPI_ADVANCED_MATCHING`, because it sends customer
data to Meta. `/privacy` §11 documents the Meta data flow, and §11.4 states in writing that
no name, phone, email or address is sent — in plaintext or hashed — so **turning advanced
matching on means editing that section in the same change.** Confirmed working end to end
on 2026-10-20: Meta recorded `Purchase` for order `TC-981360`.

The wizard's version 9 also added tags 36/37, a second GA4 config that tripled
`page_view` and duplicated every event while routing nothing to Meta (the CAPI gateway
is `NOT_ONBOARDED`). Version 10 pauses them, blocks non-production from the pixel, and
narrows trigger 24 to the events Meta's lookup maps. Two things remain open, including
SPA `page_view` firing three times — see `docs/analytics.md`.

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

**`DESIGN.md` at the root is the reference — read it before restyling anything.**
The Pencil export is gone: `design/`, `tailwind.config.ts`, `app/styles/*` and
`tests/design-tokens.test.ts` were deleted with the rebuild, and the `.pen` file
is no longer upstream of anything.

- **Tailwind v4, one CSS file.** `app/globals.css` holds every token in three
  layers: `@theme` (palette, fonts, the type scale), `:root` and `.dark`
  (semantic roles as palette references), `@theme inline` (the roles turned into
  utilities). There is no `tailwind.config.*` — v4 reads the CSS. Adding or
  changing a token goes through the `design-system` skill and through all three
  layers in one edit, and `node .claude/skills/design-system/scripts/audit.mjs .`
  has to come back clean.
- **The brand is amber** (`honey-*`), chosen by the owner on 2026-11-10 over the
  shop's old tea green and a terracotta; both of those palettes are deleted. It
  takes **ink**, not white, on the fill, and one shade serves the light page and
  the dark block. Green survives only in the photography. One consequence worth
  knowing: `warning` has no tinted surface of its own, because a pale amber
  banner and a pale brand banner measure 1.1:1 apart — DESIGN.md says what it
  uses instead.
- `components/ui/*` are real shadcn/ui components (`components.json`: style
  `new-york`, base colour `stone`, `cssVariables: true`) on the new tokens, with
  Radix underneath where one needs it, plus the project's own composites
  (`Field`, `WeightChip`, `QtyStepper`, `SectionHeading`, `TextLink`, `BackLink`,
  `InfoRow`, `Eyebrow`). A screen that needs a control which is not there gets
  one added here, not drawn inline.
- **Design work is graded.** `.claude/rules/design/` holds the rules, the linter
  is `node .claude/scripts/design-lint.mjs <files>` (a PostToolUse hook runs it
  on every `.tsx` edit under `app/`, `components/` or `context/`), and the
  `design-audit`, `design-mobile`, `design-a11y`, `design-playground` and
  `design-system` skills are how a change is checked. `.claude/reference/` keeps
  RedАвто's own DESIGN.md, globals.css and code rules as the worked example;
  its Feature-Sliced `src/` layout is deliberately **not** adopted here.
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
- Depth is the surface step (`background` → `subtle` → `card`) plus a hairline;
  a surface is set apart by its colour **or** a border, never both. Shadows are
  for overlays (`shadow-xl`) and for the mobile buy bar (`shadow-up`). Radii are
  Tailwind's own: `rounded-md` (6px) on controls, `rounded-xl` (12px) on cards and
  images. The old near-square scale is gone — a 6px card is now off-system.
- **A dark band is a `.dark` block.** `class="dark"` on a section switches every
  semantic token inside it, so primitives turn dark on their own and no `dark:`
  colour class is needed. The footer and the discover banner are the two blocks.
  Text over a photograph is never `text-primary-foreground`: that token is white
  in one brand direction and ink in another.
- Content is held by `mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8` inside
  full-bleed sections. The `w-full` is load-bearing: an auto cross-axis margin on
  a flex item shrinks it to its content, which silently collapsed every catalogue
  section once already.
- **Type: Geist only**, self-hosted through `next/font/local` from
  `app/fonts/Geist-Variable.woff2`. Not `next/font/google` — Google assigns ₴
  (U+20B4) to a `cyrillic-ext` subset that next/font does not list for Geist, so
  no combination of its subsets renders the currency sign. Sizes are Tailwind's
  steps with line height and tracking fitted to Geist and Ukrainian; the heading
  floor is 1.1, because Й and g touch at 1.073. Headings are sentence case —
  uppercase survives only on the `Eyebrow` and the wordmark.
- Layout is mobile-first, with `md:` for tablet portrait and `lg:` for tablet
  landscape and desktop. The shell is full width: the previous design's 1440px
  canvas cap with a deeper band either side is gone.
- **Mobile is the point.** Over the 90 days to 2026-09-07 the site took zero
  orders from 93 mobile sessions against 72 paid mobile clicks (`HANDOFF.md` has
  the funnel). 375px is checked first, and `design-mobile`'s measurements at 375
  are what a UI change is judged by.
- SEO: per-page `generateMetadata`, JSON-LD via `components/JsonLd.tsx` (Product, BreadcrumbList, Organization), `app/sitemap.ts`, `app/robots.ts`.
- Every absolute URL (canonical, OG, JSON-LD, sitemap, robots) comes from `siteUrl()` in
  `lib/format.ts` → `NEXT_PUBLIC_SITE_URL`. Never hardcode the domain; for metadata,
  prefer relative paths — `metadataBase` in `app/layout.tsx` resolves them.
- `app/opengraph-image.tsx` generates the default 1200×630 social card at build time
  (`next/og`), using the bundled `app/og/Oswald-SemiBold.ttf` — satori can't read woff2,
  and the site's `next/font` files aren't reachable from the route. It covers every page
  that doesn't set `openGraph.images` itself; product pages still use their own photo.
