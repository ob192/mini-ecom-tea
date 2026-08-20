# Google Merchant Center feed

The storefront publishes an RSS 2.0 product feed at **`/google-merchant.xml`**
(live: `https://jintea.restreto-labs.com/google-merchant.xml`).

- Route: `app/google-merchant.xml/route.ts` — `dynamic = 'force-static'`, so the
  feed is prerendered at build time alongside the catalogue pages. It changes
  only when `public/products.json` does; a redeploy is what refreshes it.
- Content: `lib/merchant-feed.ts` (`buildFeedItems` → `renderFeed`).
- Tests: `tests/merchant-feed.test.ts`.

## Registering it in Merchant Center

1. Merchant Center → **Products → Feeds → Add product feed**.
2. Country of sale **Ukraine**, language **Ukrainian**, currency **UAH**.
3. Input method **Scheduled fetch**, URL `https://<site>/google-merchant.xml`,
   fetch frequency daily. No authentication — the file is public and allowed by
   `robots.txt`.
4. Shipping and returns are also configured in Merchant Center account settings.
   The feed carries a per-item `g:shipping` block as a fallback (see below).

## How the catalogue maps onto the feed

| Feed attribute | Source |
| --- | --- |
| `g:id` | `offerId()` — slug flattened by `feedKey()`, plus `-<weight>g` for tiered products |
| `title` | `title[, weight г] — subtitle`, word-trimmed to 150 chars |
| `description` | `flattenDescription()` of the product description |
| `link` / `g:image_link` | `siteUrl()` + product path / `public/<slug>/<file>` |
| `g:price` | tier price (or base price), `"350.00 UAH"` |
| `g:google_product_category` | `GOOGLE_CATEGORY` by category, `GOOGLE_CATEGORY_BY_SLUG` per product |
| `g:product_type` | `Чай > Пуер`-style path from the Ukrainian category labels |
| `g:item_group_id` / `g:size` | `feedKey()` of the slug / `50 г` — only for multi-tier products |
| `g:unit_pricing_measure` | `50 g` against a `100 g` base, for anything with a weight |

**Weight tiers are variants.** A product with 25/50/100 г tiers becomes three
offers sharing one `g:item_group_id`, differentiated by `g:size`. Because Google
crawls the landing page to confirm the price, `components/JsonLd.tsx` emits one
schema.org `Offer` per tier, each with the same `sku` as the feed `g:id`.
**If you change the id format in `offerId()`, the JSON-LD follows automatically —
but if you change one of the two by hand, Google will report price mismatches.**

**RSS's own elements are not Google's.** `title`, `link` and `description` are
RSS 2.0's predefined item elements and are written **without** the `g:` prefix;
everything else in an `<item>` is a Google attribute and takes it. Prefixing
those three makes a validator report all of them as missing — the offer then has
no name, no landing page and no copy, which is the whole item. This was live for
one release. `tests/merchant-feed.test.ts` now counts `<title>`/`<link>`/
`<description>` against the item count and fails if a `g:` version reappears.

**Ids carry no path separator.** `feedKey()` flattens the slug's `/` to `-`, so
`green/longjing-cha` becomes `green-longjing-cha-25g`. Google only asks for
"valid unicode characters", so a slash is not a disapproval by itself, but it
reads as a path separator wherever the id is echoed into a URL or a report, and
validators flag it. **Changing the id format renumbers the catalogue**: Merchant
Center keys a product's history off its `id`, so new ids are new products —
performance history resets and everything needs re-review. Cheap before the
first successful ingest, expensive after. `components/JsonLd.tsx` derives the
schema.org `sku` from the same `offerId()`, so the landing page follows
automatically — verify with a build if you ever touch one of them by hand.

**Brand + MPN, no GTIN, no `identifier_exists`.** The feed used to declare
`g:identifier_exists: no` and publish neither identifier, which every feed audit
scores as "0% pass, 54 of 54 products fail".

Half of that is unavoidable and half was our mistake. **GTIN**: none exists.
A GTIN is a GS1-issued barcode, loose leaf tea has none, and fabricating one is
a disapproval rather than a fix — so the feed publishes no `g:gtin`, and a test
enforces that. **MPN**: this one we *can* supply. Google's rule is that only a
manufacturer assigns an MPN, and the important corollary is that on a
private-label product the merchant *is* the manufacturer. Google's own guidance
for the case where the merchant is the brand owner and only seller of a product
with no official brand is to use the store name as `brand` and include an MPN
"with a unique identifier number of your choice", **instead of** submitting
`identifier_exists`. That is exactly this catalogue: tea with no brand of its
own, sourced and sold as Jintea.

So `g:mpn` is `offerId()` — the same value as `g:id`, unique per weight tier —
and `g:identifier_exists` is gone. Submitting both would contradict itself:
`identifier_exists: no` asserts there are no identifiers while `g:mpn` supplies
one. `components/JsonLd.tsx` publishes the same `mpn` on the product page so the
crawled page corroborates the feed.

**This rests on Jintea being the brand owner, not a reseller.** If the tea is
ever sold under someone else's brand, that brand's real MPN belongs here and
ours does not.

**Brand and language.** `g:brand` is `Jintea` — `BRAND_NAME` in `lib/contacts.ts`,
the same value the wordmark, the page titles, the Organization JSON-LD and the
schema.org `Brand` use. It briefly carried the bare host
(`jintea.restreto-labs.com`) instead, which cost the shop twice: with
`identifier_exists: no` every offer leans on brand + title to be matched, so a
URL there means a search for "Jintea" matches nothing, and the Knowledge Graph
has no name to bind the shop to. `tests/merchant-feed.test.ts` now rejects any
`g:brand` that looks like a hostname.

The feed declares `<language>uk</language>`, matching `<html lang="uk">`. **This
element does not decide anything.** Google takes the content language from the
feed *registration* in Merchant Center, so a feed registered as English stays
English no matter what the XML says — fix that in Merchant Center → the feed's
settings. Registered as `en` while the copy is Ukrainian, Google reads the shop
as English-language and matches the ads to the wrong queries.

**Shipping.** `g:shipping` quotes what an order containing only that item would
actually cost: `0.00 UAH` at or above the 500 ₴ free-delivery threshold, else
`100.00 UAH`. `FREE_DELIVERY_THRESHOLD` / `DELIVERY_FEE` come from
`lib/shipping.ts`, which `context/CartContext.tsx` and `app/api/order/route.ts`
also import, so the feed, the cart and the authoritative server-side total can
no longer disagree. Google also reads the shipping cost
stated on the site itself, so `app/delivery/page.tsx` has to quote the same two
numbers in prose; it once said "від 80 грн" while the feed published `60.00 UAH`,
which is exactly the mismatch Merchant Center flags.

**Policy pages.** Merchant Center requires the shop's terms to be visible on the
site itself:

| Page | Route | Covers |
| --- | --- | --- |
| Оплата і доставка | `/delivery` | payment method (COD via Nova Poshta), shipping cost, timings |
| Обмін та повернення | `/returns` | 14-day return right, refund procedure, contacts |
| Угода користувача | `/privacy` | personal-data processing policy |

All three are linked from the footer and from under the checkout submit button
(cart and checkout do not render the footer). `components/CookieConsent.tsx` adds
the cookie notice that points at `/privacy`.

Two things the pages alone do not cover: the return policy still has to be filled
in on the Merchant Center account settings side, and the site publishes no legal
entity details (ФОП/ЄДРПОУ, registered address) — a deliberate choice, but it is
the most likely remaining Misrepresentation trigger if the account is reviewed.

## What gets advertised

**Tea only.** `ADVERTISED_CATEGORIES` in `lib/merchant-feed.ts` lists the five
tea categories (`puer`, `green`, `oolong`, `red`, `white`). Teaware — гайвані,
чайники, піали, аксесуари, чайні фігурки — and the gift sets stay in the
storefront and the sitemap but are kept out of the feed. Add a slug to that set
to bring a category back; nothing else in the feed is category-aware.

One consequence worth knowing: `set/start-mini-7` is a tea assortment, not
teaware, and `GOOGLE_CATEGORY_BY_SLUG` still classifies it as tea — but it lives
under the `set` category, so it is excluded along with the rest of the sets.
Moving it into a tea category, or adding `set` to `ADVERTISED_CATEGORIES`, are
the two ways back in.

**Exclusions.** Two different things drop a product, and `feedExclusionFor()`
checks them in this order:

1. `category not advertised` — deliberate, per the set above.
2. `no price` / `no photo` — a product that *should* be advertised but cannot be
   (`g:image_link` is required and the branded placeholder gradient is not a
   product photo).

Only the second kind is a problem, which is what `feedDefects()` isolates. The
route logs a count of everything and names only the defects, so the deliberate
exclusions do not drown them out:

```
[merchant-feed] 54 offer(s), 27 product(s) skipped
```

Currently 17 tea products produce 54 offers, and `feedDefects()` is empty — the
photo-less `figurine/tiger-yixing` no longer registers, because figurines are
not advertised at all. `tests/merchant-feed.test.ts` pins both halves: nothing
outside the tea categories may appear, every tea category must appear, and
`feedDefects()` must stay empty.

## Verifying a change

```bash
npm test && npm run build
```

The build log prints the skipped products. To inspect the generated feed:

```bash
curl -s http://localhost:3000/google-merchant.xml | head -60
```

Beyond the unit tests, Merchant Center's own **Diagnostics** tab is the real
check after the first fetch; expect "Missing GTIN" style warnings to be absent
because of `identifier_exists`, and watch for image-crawl errors, which mean
Cloudflare or `robots.txt` blocked `googlebot-image`.
