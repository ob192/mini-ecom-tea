# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

jintea.shop — a mobile-first, SEO-optimized Ukrainian leaf-tea storefront. Next.js 15 (App Router) + TypeScript + Tailwind. No database, no online payment: orders are validated and priced server-side, then pushed to a Telegram chat via the Bot API; the customer pays on delivery. All UI copy is Ukrainian.

## Commands

```bash
npm run dev        # dev server (http://localhost:3000)
npm run build      # production build
npm run start      # run the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

There is no test suite/framework configured in this repo.

Required env vars (see `.env.example`): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NEXT_PUBLIC_SITE_URL`. The Nova Poshta integration (see below) additionally requires `NOVA_POSHTA_API_KEY` server-side, which is **not** currently listed in `.env.example` — set it manually in `.env.local` or the NP city/warehouse lookups will 500.

## Data model: `public/products.json`

This is the single source of truth for the catalog. `lib/products.ts` reads it and normalizes each raw entry into the `Product` shape (`lib/types.ts`) at build/import time — there is no runtime DB.

- A product's **category is derived from its slug prefix**, not a separate field: `"green/longjing-cha"` → category `green`. There is no validation that the prefix is a known category; it just falls through.
- The fixed category list (order + Ukrainian labels) lives in `CATEGORY_ORDER` in `lib/products.ts`, and the allowed slugs are separately typed as `CategorySlug` in `lib/types.ts`. Adding a category means updating both.
- Products can have a single `price`/`weight`, or a `priceTiers: {weight, price}[]` list (e.g. 25 г / 50 г / 100 г options). `priceFor(product, weight)` resolves the price for a chosen tier; with tiers present, only exact weight matches resolve — everything else is `null` ("unavailable").
- `inStock` is derived (`price != null`), not an authored field.
- Each product's images live under `public/<slug>/` (e.g. `public/green/longjing-cha/1.jpg`); `files: string[]` in the JSON lists filenames, and `lib/products.ts` resolves them to `/​<slug>/<file>` public paths.
- `images/` at the repo root (untracked) holds one-off ingestion tooling (`parse_docx.py`, `reorg.sh`) used to turn supplier `.docx` product sheets + photos into `public/products.json` entries and `public/<slug>/` image folders. It's not part of the running app.

## Routing

- `/` — catalog (`app/page.tsx`), statically generated, category filter via `CatalogGrid`.
- `/product/[...slug]` — **catch-all** route (`app/product/[...slug]/page.tsx`), because product slugs are multi-segment (`category/product-name`). `generateStaticParams` splits `Product.slug` on `/`.
- `/cart`, `/checkout`, `/order/success` — client cart flow.
- `/about`, `/brewing`, `/contacts`, `/delivery` — static informational pages.
- `app/api/order/route.ts` — order submission → Telegram.
- `app/api/np/cities`, `app/api/np/warehouses` — Nova Poshta lookups (see below).

## Cart

`context/CartContext.tsx` is a React Context + `useReducer`, persisted to `localStorage` under `teache_cart_v2` (the version suffix was bumped when the line-item shape changed to include `weight` — bump it again if the persisted shape changes). Cart lines are keyed by `(slug, weight)`, not just `slug`, since the same product can be added at different weight tiers. On hydration, stale/invalid lines (unknown slug, price no longer resolvable for that weight) are silently dropped.

`FREE_DELIVERY_THRESHOLD` (500) and `DELIVERY_FEE` (60) are duplicated as constants in both `context/CartContext.tsx` (client-side display) and `app/api/order/route.ts` (authoritative, server-side total) — there's no shared config module, so keep them in sync if either changes.

## Checkout, delivery, and the order API

Delivery is Nova Poshta only, either to a branch/postomat (`np_warehouse`, needs a warehouse) or by courier to a street address (`np_courier`). `lib/checkout-schema.ts` (Zod) validates the form client-side via `react-hook-form`; `app/api/order/route.ts` re-validates everything server-side and **never trusts client-submitted prices or totals** — it recomputes line items and the total from `public/products.json` via `getProduct`/`priceFor`.

- `lib/nova-poshta.ts` is a server-only client (`NOVA_POSHTA_API_KEY` never reaches the browser); all NP traffic is proxied through `app/api/np/cities` and `app/api/np/warehouses`, which apply a much looser rate limit (60/min) than order submission, plus a 30-minute in-process cache keyed by query (and by city for warehouses).
- `app/api/order/route.ts` has a honeypot field (`company`): if filled, it returns a fake success without sending anything, to silently drop bot submissions.
- `lib/rate-limit.ts` is an in-memory fixed-window limiter stored on `globalThis` (survives HMR in dev). It is **per-process**, not shared across serverless instances — fine as a basic guard, not a hard limit in a multi-instance deployment.

## UI / design system

- `components/ui/*` are shadcn/ui components (`components.json`: style `new-york`, base color `stone`, `cssVariables: true`). Brand colors (`paper`, `ink`, `green`, `amber`, etc.) are defined directly in `tailwind.config.ts`; shadcn's own utilities (`bg-background`, `text-foreground`, `ring-ring`, …) are bridged to the same brand theme via HSL CSS variables in `app/styles/tokens.css`. When touching either the brand palette or shadcn components, keep both in sync.
- Fonts: Oswald (display) + PT Sans (body), loaded with Cyrillic subsets in `app/layout.tsx`.
- Layout is mobile-first, generally centered in a narrow column, with `lg:` breakpoints added for desktop where relevant (see `app/product/[...slug]/page.tsx` for the pattern: single column on mobile, two-column grid on `lg:`).
- SEO: per-page `generateMetadata`, JSON-LD via `components/JsonLd.tsx` (Product, BreadcrumbList, Organization), `app/sitemap.ts`, `app/robots.ts`.
