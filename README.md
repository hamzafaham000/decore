# Decore

A storefront for a short shop of office and home pieces. Next.js 16 (App Router,
Cache Components), Tailwind 4, Postgres via Prisma 7.

Launch state: fourteen pieces across four categories — seating, tables and desks, lighting
and decor — three of them photographed, plus a cart and a checkout that records real orders.
Products, orders and first-party traffic are all managed from `/admin`. Card payments are
**not** wired to a gateway yet — see [Payments](#payments).

## Run it

The app talks to Postgres on `localhost:5432`, using the `decore` role and database.
Homebrew's `postgresql@16` is already running on this machine; create the role and
database once if they are missing:

```bash
psql -d postgres -c "CREATE ROLE decore LOGIN PASSWORD 'decore' CREATEDB;"
psql -d postgres -c "CREATE DATABASE decore OWNER decore;"
```

Then:

```bash
pnpm install
cp .env.example .env          # then edit
pnpm prisma migrate deploy    # creates the tables
pnpm db:seed                  # categories, fourteen pieces, the owner account
pnpm dev                      # http://localhost:3000
```

The seed reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` and creates that owner, or resets the
password if the account already exists. The checked-in example is `owner@example.com` /
`change-me`; change both, then run `pnpm db:seed` again before the shop goes public.
Sign in at `/admin`.

The seed is a starting point, not a sync: run it once, then edit pieces in the dashboard.
Running it again restores the seeded copy of every piece it knows about, so avoid it on a
live catalogue unless that is what you want.

Prefer Docker? `docker compose up -d` publishes the same database on `localhost:5433`
(coexisting with the Homebrew server), so point `DATABASE_URL` at `5433` and run the
migrations and seed again. Change `docker-compose.yml` and `DATABASE_URL` together if you
move it. Either way the credentials are `decore` / `decore`.

## Deploy

`src/generated/prisma` is gitignored and produced by `postinstall` (`prisma generate`). Any
host that runs a normal `pnpm install` gets it for free — but a build that skips install
scripts will fail on `Can't resolve '@/generated/prisma/client'`.

Set these in the host's environment:

| Variable | Needed for |
| --- | --- |
| `DATABASE_URL` | catalogue, dashboard, orders and receipts, at runtime only |
| `SITE_URL` | canonicals, sitemap, structured data — must be the real public origin |
| `WHATSAPP_NUMBER` | the order hand-off |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | the owner account created by `pnpm db:seed` |

The build compiles without any of them, but the shop cannot render a catalogue without a
seeded database. Point `DATABASE_URL` at the production database, run
`pnpm prisma migrate deploy` and `pnpm db:seed` once before the first real order.

**Image uploads.** Files are written to `data/uploads` (outside `public`, gitignored) and
served by `/api/uploads/[name]` with a one-year cache header. That is correct for a machine
or a server with a persistent disk, but not for a read-only host such as Vercel: a deploy
starts with an empty disk. Swap `saveUpload` in `src/lib/uploads.ts` for object storage
(Blob, S3 or R2) before deploying there — products store plain URLs, so nothing else needs
to change. Unexpired images in the catalogue keep working only as long as their files exist.

## Things to replace before launch

| What | Where |
| --- | --- |
| Brand name, tagline, email, WhatsApp display number | `src/lib/brand.ts` |
| WhatsApp number that receives orders | `WHATSAPP_NUMBER` in `.env` |
| Delivery fee, free-delivery threshold, advance % | `commerce` in `src/lib/brand.ts` |
| The products themselves | `/admin/products` |
| The owner login | `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then `pnpm db:seed` |
| Product photography | upload in the dashboard, or paste a URL |
| Page measure, action appearance | `page-shell`, `btn-primary`, `btn-outline` in `src/app/globals.css` |
| Public origin for canonicals, sitemap and structured data | `SITE_URL` in `.env` |

Postgres is the catalogue. `src/lib/catalog.ts` reads it through `"use cache"` with the
`catalog` tag and `cacheLife("max")`; every dashboard save calls `updateTag("catalog")`, so
the next storefront request waits for the fresh copy instead of serving the old one. New
pieces are live without a rebuild — `generateStaticParams` still prerenders the pieces that
existed at build time, and anything added later renders on demand.

`prisma/seed-data.ts` is a snapshot of the catalogue as it was before the database took
over — the seed source, never imported by the app.

Until a product has an image, it renders a drawn placeholder from `ProductImage`. That is
deliberate: add a photograph in the dashboard, and the placeholder disappears.

The first image is the cover. Add more and the detail page grows a thumbnail
strip under the image at every width — horizontal on phones, the same row on desktop so the
photograph keeps the full column. JSON-LD and the sitemap emit every photo, not just the cover.

The strip stays complete before the shoot: `ProductGallery` fills it to three views, so a piece
with no photography shows Front view, Detail and In the room as three differently drawn
placeholders, and a piece with only a cover gets the two angles still to come. Real images
replace the fillers from the front, so the layout never shifts when photography arrives.

Categories live in the same database: four flat entries — Seating, Tables & Desks, Lighting,
Decor — each with a slug, label and blurb. A product's `line` is one of those labels, and the
`/collection/[category]` route is generated from the list. A piece counts toward a category by
matching its `line`; there is no second level and no parent "Furniture" page.

Three pieces have photography, all in the Decor line: `panah-table-sculpture.avif` (300 × 300),
`girih-linked-sculpture.avif` (300 × 300) and `suhbat-stacked-sculpture.avif` (584 × 731 — the
original was 419 wide, too narrow for a 4:5 slot, so it was extended left and right onto a blurred
copy of itself rather than cropped).

Two things still need doing. They are all stand-ins for pieces we have not shot, and each is
smaller than the large slots want — the detail page frames them at 30rem rather than stretching
them across the column, but they should still be re-exported at 1200 px or wider. And only Panah
carries a licence marker (CC0, in its metadata); the other two carry none, so confirm the rights on
them before launch.

## Design system

Warm paper (`#f5f3ee`) and near-black ink, one deep pine accent and a clay tone for errors. Instrument
Serif for display type, Instrument Sans for everything else. Tokens, type utilities, buttons and
fields live in `src/app/globals.css`; there are no per-page colour overrides.

The interface keeps the catalogue photography low-resolution without hiding it: `ProductImage`
accepts `framed`, which mats a piece inside a smaller centred frame instead of upscaling it across a
full column, and `compact` for cart thumbnails.

## Home page

Hero with the interactive lookbook → a selection from the shop → our approach →
a pine featured-piece band → the closing invitation.

The hero pairs the statement with a stage showing the three photographed pieces. Thumbnails switch
the image, name, finish and price without leaving the page. The featured-piece band reads its
materials, height and price from the catalogue rather than repeating them by hand.

All of the copy, prices and images render on the server. The client components on the route are
`Reveal` (a fade and rise as each block enters view), `HeroShowcase`, the header (which carries the
search dialog), and the cart drawer.

The home page states no product counts and no lead-time window — not in the hero, not beside
“Start here”, and not in the closing link. Lead time and advance terms live where they change a
decision — the product page, the cart, and the checkout summary.

The shop page adds a sticky toolbar. Category chips are real links to `/collection/seating`,
`/collection/tables`, `/collection/lighting` and `/collection/decor`, so they are crawlable; Room
and Price are client-side filters over the prerendered grid. A category page reuses the same
toolbar with its own chip marked current. `?room=` deep links are not supported yet.

## Search

A dialog rather than a page. The header search button, `⌘K` / `Ctrl+K`, or `/` opens it. Results
filter as you type and are keyboard-navigable: `↑` `↓` to move, `Enter` to open, `Esc` to close.
Focus is trapped while it is open and returned to the trigger on close, and the page behind is
scroll-locked.

The index is built on the server in `src/lib/search-index.ts` — fourteen compact records of name, line,
tagline, finishes, materials and rooms — and passed into the header, so the long product
descriptions never reach the browser. Matching lives in `src/lib/search.ts`: accents and punctuation
are normalised, every word must match, and fields are weighted name > line > tagline >
finishes/materials > room. Common synonyms score at half weight (`sofa` → chair, `wooden` → walnut,
`lamp` → lighting), so literal matches still rank first. Rooms stay literal, which is why `desk`
returns the writing desk and the table sculpture rather than every office piece.

Recent searches live in `localStorage` under `decore-recent-searches` (four, deduped against the
suggestion chips). An empty result offers a clear action and a route to us. The dialog is
client-rendered, so it adds nothing to the static HTML or to SEO.

Where this kind of page normally puts a discount badge or a struck-through price, there is none —
nothing here is marked down, rated, or labelled new, and the honest substitutes are the price,
the finish count, and the advance/balance split. `product.line` is printed as a label on each card and on
the detail page, and the shop toolbar is the one place it becomes a filter.

## Dashboard

`/admin` is part of the same Next app, server-rendered behind a login and marked `noindex`.

- **Overview** — orders waiting on a reply, seven-day order count and value, visits and
  visitors, and how many pieces are live or drafted.
- **Products** — list with live/draft filters, create, edit, delete, publish toggle, image
  upload, image order, and the piece's position in the shop. Slugs are built from the name
  and kept unique; a blank web address is filled in automatically.
- **Orders** — status filters, search by reference, name or phone, the full receipt, status
  and advance-received controls, and a WhatsApp link to the buyer.
- **Traffic** — first-party page views over 7, 30 or 90 days: views by day, most-viewed pages,
  referrers and devices.

Authentication is database sessions. `AdminUser` stores a scrypt hash; `AdminSession` stores
a SHA-256 hash of a random token, never the token itself. The browser holds a 12-hour
`HttpOnly`, `SameSite=Lax` cookie. `src/lib/auth.ts` is the only code that reads or writes a
session; every dashboard page and every admin action starts with `requireAdmin()`.

Traffic is recorded by `AnalyticsBeacon`, a small client component mounted in the site layout
that posts the path to `/api/track` on navigation. A random visitor id lives in
`localStorage`, never a cookie; bots, `/admin` and `/api` are ignored. Rows land in
`PageView`; nothing is shared with a third party.

## Orders

`POST /api/orders` validates the payload, **re-reads every price from the catalogue** (the
browser only sends slug, finish, quantity), writes the `Order` and its `OrderItem` rows in
one insert, and returns a reference like `DC-EWL7X8MB`. The buyer lands on
`/order/[reference]`, which reads the row back and offers a WhatsApp handoff pre-filled
with the order.

Every order starts as `AWAITING_CONFIRMATION`. Nothing auto-confirms — we reply by hand, which is
the point at this volume.

The receipt states a build window, and it is derived rather than stored: `OrderItem` keeps the
`productSlug`, so the page reads the lead times back out of the catalogue and quotes the longest.
A piece that has since left the catalogue simply contributes nothing. The same figure appears in
the WhatsApp handoff, measured from confirmation rather than from the order date.

Receipts are `noindex`. They carry a buyer's name and street address, and the reference is
unguessable but not secret — an indexed `/order/*` is a page of personal data in a search engine.
`/checkout` is excluded for the same reason, along with `/api`.

Receipts have no buyer login, so the reference is the only thing standing between one buyer
and another's receipt. It comes from a cryptographic source for that reason. The dashboard
login protects `/admin`; it does not gate the receipt route.

Three checkout methods, all defined in `src/lib/checkout-methods.ts`:

- **Card** — records the order; the advance is collected once a gateway exists.
- **Advance, then cash on delivery** — 30% to confirm the build, balance on delivery.
- **Order on WhatsApp** — sends the selection to us.

The advance split is computed in `src/lib/pricing.ts` and rounded to the nearest thousand,
because nobody wires Rs 85,500.

The cart drawer shows that split before the buyer commits — subtotal, advance now, balance on
delivery — along with a progress line against `commerce.freeDeliveryFrom`. All of it comes from
the same pricing helpers the checkout summary and the server use, so the drawer cannot promise a
number the order will not match.

## Payments

Stripe and Shopify Payments do not operate in Pakistan, so card checkout needs a local
gateway: Safepay, XPay, PayPro, NayaPay, or bank acquiring through Bank Alfalah / HBL.
Onboarding needs an NTN, a registered business, and a local bank account.

When an account exists, `src/lib/payments.ts` is the only file that needs to change. It
returns a `redirectUrl`; if that is non-null the checkout form sends the buyer to the
gateway instead of the confirmation page, and a webhook should flip `advancePaid` and
`status`. Nothing else in the app assumes a provider.

## SEO and answer engines

Absolute URLs come from one place — `src/lib/site.ts`, reading `SITE_URL`. It feeds
`metadataBase`, the canonicals, `sitemap.xml`, `robots.txt`, the Open Graph URLs and the structured
data, so setting that variable in `.env` is what makes the whole set correct on the real host.
Unset it falls back to `http://localhost:3000` in development and `https://decore.pk` in production,
so a forgotten variable cannot publish localhost canonicals.

Every route has its own title, description, canonical and `og:url`; there are no template-generated
duplicates. The home page, shop, the four category pages, made-to-order, contact and each of the
fourteen pieces were checked in the served HTML.

**Social cards.** `app/opengraph-image.tsx` and `app/product/[slug]/opengraph-image.tsx` render
1200 × 630 PNGs with `next/og` — one store card and one per piece, carrying the name, tagline, price
and lead time. Pages that define their own `openGraph` object include `siteOgImage` from
`src/lib/seo.ts`, because a page-level object replaces the layout's image rather than merging into
it.

**Structured data.** All builders live in `src/lib/seo.ts` and render through
`src/components/json-ld.tsx`, which escapes `<`:

- `Organization` + `WebSite` on every page, with the WhatsApp number, email, opening hours,
  `areaServed: Pakistan` and stable `@id`s so the rest of the graph can point at them.
- `Product` + `BreadcrumbList` on each piece: absolute image when one exists, `PKR` price,
  `MadeToOrder` availability, material, dimensions and finishes as `PropertyValue`s, seller and
  `areaServed` on the offer, and the piece's own lead time.
- `CollectionPage` + `ItemList` on `/collection` and on each of the four category pages, listing
the pieces in that category. Category pages also carry a `BreadcrumbList`, and product breadcrumbs
run Home → Shop → Category → piece.
- `WebPage` + `FAQPage` on `/made-to-order`, and `FAQPage` on `/contact` for the visible accordion.

**Crawl surfaces.** `app/sitemap.ts` lists all 22 URLs — eight pages and fourteen pieces — with
`<image:image>` entries for the three photographed pieces. `app/robots.ts` allows the catalogue and disallows `/checkout`, `/order` and
`/api`, then repeats that group by name for `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`,
`PerplexityBot`, `Perplexity-User`, `ClaudeBot`, `Claude-User`, `Claude-SearchBot`,
`Google-Extended`, `Applebot-Extended`, `Bingbot` and `CCBot`. `*` already covers them; the named
groups make the intent explicit and survive a future tightening of `*`.

**Answer engines.** `/llms.txt` is the short index (positioning, key facts, page list, pieces,
questions) and `/llms-full.txt` carries the whole catalogue with specs, finishes, dimensions and
process answers. Both are generated from the database through `src/lib/catalog.ts` and
`src/lib/seo.ts`, so a price or lead time cannot be quoted out of date. Both routes return
`text/plain` and are listed in the README rather than linked in the footer.

**What is deliberately absent.** There is no `aggregateRating`, because nothing has been rated; no
`Review`, for the same reason. There is no `hasMerchantReturnPolicy` and no `shippingDetails`, because
the store has no published returns policy and shipping is quoted per order. Adding either would make
the markup assert something the business does not honour. Availability is `MadeToOrder`, not
`InStock`, because these pieces are built after the order. The sitemap has no `lastModified`: the
catalogue is code with no per-piece dates, and inventing a timestamp would be a false signal.

The `/made-to-order` page is the citable hub for process questions: lead time, advance, delivery,
finish samples and cancellation, all on one URL with the FAQ marked up. Product delivery accordions
link to it rather than repeating the whole policy.

Two limits worth naming. Room and Price remain client-side filters, so there is no crawlable
landing page for “office furniture” or a price band yet; only the four categories are URLs. And
eleven of the fourteen pieces have no photograph, so they cannot earn Google Images or
merchant-listing visibility. Both are business inputs, not code gaps.

## Verified

- `pnpm typecheck`, `pnpm build` and `pnpm lint` pass.
- All routes return 200; product pages render their content in the initial HTML with no
  skeleton, and `/order/[reference]` blocks until the receipt is ready instead of streaming a
  placeholder.
- The dashboard was exercised end to end: sign in and out, overview counts, product list,
  create/edit/delete, publish toggle, image upload, order status and advance toggle, and the
  traffic page. A published test piece appeared on the storefront and its page returned 200
  with its uploaded image; both the piece and the file were then removed.
- Catalogue writes are visible on the next storefront request (the `catalog` tag is expired by
  `updateTag`), and drafts never appear on the shop.
- Page views recorded by the beacon appear in `/admin/analytics` with path, device and referrer.
- Two real orders were placed through the API and read back from Postgres with correct
  totals, advance, and balance.
- The refactor was checked by diffing the rendered DOM of twelve routes before and after,
  with `class` attributes normalised away: identical. The only intended rendering change is
  that Materials values now use tabular figures, as Dimensions already did.
- After the hero was replaced and the terms band removed, `/` still prerenders as static, and the
  served HTML carries the new hero with none of the four figures that used to sit under it.
- `pnpm build` now emits `/robots.txt` and `/sitemap.xml`, plus `/llms.txt` and `/llms-full.txt`.
  Served `robots.txt` carries the three disallows, the sitemap line and the named AI-crawler groups;
  `sitemap.xml` lists 22 URLs and `<image:image>` for the three photographed pieces. Canonicals,
  `og:url` and `og:image` appear on `/`, `/collection`, `/made-to-order`, `/contact` and every
  product page; `/checkout` and a real receipt both return `noindex`.
- Every JSON-LD block parses. The graph carries `Organization` and `WebSite` sitewide,
  `Product` + `BreadcrumbList` per piece, `CollectionPage` + `ItemList` on `/collection` and on
  each category page (which also carry a `BreadcrumbList`), and `WebPage` + `FAQPage` on
  `/made-to-order`. The product offer states `PKR`, the catalogue price,
  `MadeToOrder`, the seller and the piece's own lead time, with no unescaped `<`.
- Lighthouse (accessibility, best practices, SEO) scored 100 on `/`, `/collection`, both a
  photographed and an unphotographed product, `/contact` and `/made-to-order` at the last full audit,
  with no failing audits. It has not been re-run since the shop split.
- Site and per-product Open Graph images render as 1200 × 630 PNGs, and the fourteen product cards
  are byte-different from each other.
- The free-delivery nudge and the advance rows exist in the cart drawer's client chunk, and the
  build window appears in a real receipt's HTML and in its WhatsApp handoff.
- Quantities above `commerce.maxQuantity` are rejected by the API, and the cart clamps to the
  same number, so the browser cannot build an order the server refuses.
- The shop serves `/collection` plus `/collection/seating`, `/tables`, `/lighting` and `/decor`.
  Chips, Room and Price were exercised at 390 and 1280: 14 pieces → 7 (Home, under 100k) → 14 on
  clear, with the count matching the rendered cards and no horizontal overflow. The sticky toolbar
  measures 122 px at both widths, and an unknown slug returns 404.

## Not verified

- **The hero has been checked at three widths, not every width.** At 1440×900 the stage measures
  416 × 499 inside a 783 px hero; at 390 the stage is 350 × 420, and the three-piece lookbook
  switches image, name, finish and price with real clicks. 1000 px was checked too.
  Widths between those stops are inferred, not measured.
- The cart drawer only renders when open, so the Escape handler, the body scroll lock, the width
  of the progress rule, and the two money rows were confirmed by reading code and the compiled
  chunk, not by interaction.
- The structured data was checked by parsing it locally. It has not been through Google's
  rich results test, and nothing here proves a crawler agrees.
- The mobile menu has been opened and closed at 390 px: it lists Shop, Contact and WhatsApp,
  and the page behind does not overflow. Its scroll lock and Escape-to-close were not separately
  asserted.
- No real card is charged, and no gateway webhook exists.
- The order confirmation page returns HTTP 200 with a not-found body for a bad reference.
  The site layout streams its navigation before the page can set a status, and a receipt is
  `noindex`, so this is cosmetic rather than an indexing problem.
