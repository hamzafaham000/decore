# Decore

A storefront for a short collection of office and home pieces. Next.js 16 (App Router,
Cache Components), Tailwind 4, Postgres via Prisma 7.

Launch state: six pieces in the collection, three of them photographed, plus a cart and a
checkout that records real orders. Card payments are **not** wired to a gateway yet — see
[Payments](#payments).

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
pnpm dev                      # http://localhost:3000
```

Prefer Docker? `docker compose up -d` publishes the same database on `localhost:5433`
(coexisting with the Homebrew server), so point `DATABASE_URL` at `5433` and run the
migrations again. Change `docker-compose.yml` and `DATABASE_URL` together if you move
it. Either way the credentials are `decore` / `decore`.

## Things to replace before launch

| What | Where |
| --- | --- |
| Brand name, tagline, email, WhatsApp display number | `src/lib/brand.ts` |
| WhatsApp number that receives orders | `WHATSAPP_NUMBER` in `.env` |
| Delivery fee, free-delivery threshold, advance % | `commerce` in `src/lib/brand.ts` |
| The products themselves | `src/lib/products.ts` |
| Product photography | `public/products/`, then set `image` per product |
| Page measure, action appearance | `page-shell`, `btn-primary`, `btn-outline` in `src/app/globals.css` |
| Public origin for canonicals, sitemap and structured data | `SITE_URL` in `.env` |

`src/lib/products.ts` is the only source of catalogue data — every page, the cart, the
checkout summary, and the order API read from it. Adding a piece means adding one object;
`generateStaticParams` picks up the new URL at build time.

Until a product has an `image`, it renders a drawn placeholder from `ProductImage`. That is
deliberate: drop the file in, set the path, and the placeholder disappears.

Three pieces have photography, all in the Objects line: `panah-table-sculpture.avif` (300 × 300),
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

Hero with the interactive lookbook → the whole collection → our approach →
a pine featured-piece band → the closing invitation.

The hero pairs the statement with a stage showing the three photographed pieces. Thumbnails switch
the image, name, finish, lead time and price without leaving the page; a single proof line under the
CTAs carries the made-to-order window. The featured-piece band reads its materials, height, price
and lead time from the catalogue rather than repeating them by hand.

All of the copy, prices and images render on the server. The client components on the route are
`Reveal` (a fade and rise as each block enters view), `HeroShowcase`, the header (which carries the
search dialog), and the cart drawer.

The home page states no product counts — not in the hero, not beside “The collection”, and not in
the closing link. The lead-time window is the only number it asserts. Delivery and advance terms
live where they change a decision — the product accordion, the cart, and the checkout summary.

The collection page adds a sticky browser that filters by line and by room. Filters are client state,
so every piece is still in the prerendered HTML and crawlable; `?line=` deep links are not supported
yet.

## Search

A dialog rather than a page. The header search button, `⌘K` / `Ctrl+K`, or `/` opens it. Results
filter as you type and are keyboard-navigable: `↑` `↓` to move, `Enter` to open, `Esc` to close.
Focus is trapped while it is open and returned to the trigger on close, and the page behind is
scroll-locked.

The index is built on the server in `src/lib/search-index.ts` — six compact records of name, line,
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
nothing here is marked down, rated, or labelled new, and the honest substitutes are the lead time,
the price, and the advance/balance split. `product.line` is printed as a label on each card and on
the detail page, and the collection browser is the one place it becomes a filter.

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

There is no authentication in this app, so the reference is the only thing standing between one
buyer and another's receipt. It comes from a cryptographic source for that reason; the receipt
route is otherwise public.

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
duplicates. The home page, collection, made-to-order, contact and each of the six pieces were checked
in the served HTML.

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
- `CollectionPage` + `ItemList` on `/collection`, listing every piece in catalogue order.
- `WebPage` + `FAQPage` on `/made-to-order`, and `FAQPage` on `/contact` for the visible accordion.

**Crawl surfaces.** `app/sitemap.ts` lists all ten URLs, with `<image:image>` entries for the three
photographed pieces. `app/robots.ts` allows the catalogue and disallows `/checkout`, `/order` and
`/api`, then repeats that group by name for `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`,
`PerplexityBot`, `Perplexity-User`, `ClaudeBot`, `Claude-User`, `Claude-SearchBot`,
`Google-Extended`, `Applebot-Extended`, `Bingbot` and `CCBot`. `*` already covers them; the named
groups make the intent explicit and survive a future tightening of `*`.

**Answer engines.** `/llms.txt` is the short index (positioning, key facts, page list, pieces,
questions) and `/llms-full.txt` carries the whole catalogue with specs, finishes, dimensions and
process answers. Both are generated from `src/lib/products.ts` and `src/lib/seo.ts`, so a price or
lead time cannot be quoted out of date. Both routes return `text/plain` and are listed in the
README rather than linked in the footer.

**What is deliberately absent.** There is no `aggregateRating`, because nothing has been rated; no
`Review`, for the same reason. There is no `hasMerchantReturnPolicy` and no `shippingDetails`, because
the store has no published returns policy and shipping is quoted per order. Adding either would make
the markup assert something the business does not honour. Availability is `MadeToOrder`, not
`InStock`, because these pieces are built after the order. The sitemap has no `lastModified`: the
catalogue is code with no per-piece dates, and inventing a timestamp would be a false signal.

The `/made-to-order` page is the citable hub for process questions: lead time, advance, delivery,
finish samples and cancellation, all on one URL with the FAQ marked up. Product delivery accordions
link to it rather than repeating the whole policy.

Two limits worth naming. Client-side filters on `/collection` do not create crawlable category URLs,
so there is no landing page for “office furniture” or “walnut desk” yet. And three of the six pieces
have no photograph, so they cannot earn Google Images or merchant-listing visibility. Both are
business inputs, not code gaps.

## Verified

- `pnpm typecheck`, `pnpm build` and `pnpm lint` pass.
- All routes return 200; product pages prerender as static, `/order/[reference]` streams.
- Two real orders were placed through the API and read back from Postgres with correct
  totals, advance, and balance.
- The refactor was checked by diffing the rendered DOM of twelve routes before and after,
  with `class` attributes normalised away: identical. The only intended rendering change is
  that Materials values now use tabular figures, as Dimensions already did.
- After the hero was replaced and the terms band removed, `/` still prerenders as static, and the
  served HTML carries the new hero with none of the four figures that used to sit under it.
- `pnpm build` now emits `/robots.txt` and `/sitemap.xml`, plus `/llms.txt` and `/llms-full.txt`.
  Served `robots.txt` carries the three disallows, the sitemap line and the named AI-crawler groups;
  `sitemap.xml` lists ten URLs and `<image:image>` for the three photographed pieces. Canonicals,
  `og:url` and `og:image` appear on `/`, `/collection`, `/made-to-order`, `/contact` and every
  product page; `/checkout` and a real receipt both return `noindex`.
- Every JSON-LD block parses. The graph carries `Organization` and `WebSite` sitewide,
  `Product` + `BreadcrumbList` per piece, `CollectionPage` + `ItemList` on `/collection`, and
  `WebPage` + `FAQPage` on `/made-to-order`. The product offer states `PKR`, the catalogue price,
  `MadeToOrder`, the seller and the piece's own lead time, with no unescaped `<`.
- Lighthouse (accessibility, best practices, SEO) scores 100 on `/`, `/collection`, both a
  photographed and an unphotographed product, `/contact` and `/made-to-order`, with no failing
  audits.
- Site and per-product Open Graph images render as 1200 × 630 PNGs, and the six product cards are
  byte-different from each other.
- The free-delivery nudge and the advance rows exist in the cart drawer's client chunk, and the
  build window appears in a real receipt's HTML and in its WhatsApp handoff.
- Quantities above `commerce.maxQuantity` are rejected by the API, and the cart clamps to the
  same number, so the browser cannot build an order the server refuses.

## Not verified

- **The hero has been checked at three widths, not every width.** At 1440×900 the stage measures
  416 × 499 inside a 783 px hero; at 390 the stage is 350 × 420, and the three-piece lookbook
  switches image, name, finish, lead time and price with real clicks. 1000 px was checked too.
  Widths between those stops are inferred, not measured.
- The cart drawer only renders when open, so the Escape handler, the body scroll lock, the width
  of the progress rule, and the two money rows were confirmed by reading code and the compiled
  chunk, not by interaction.
- The structured data was checked by parsing it locally. It has not been through Google's
  rich results test, and nothing here proves a crawler agrees.
- The mobile menu has been opened and closed at 390 px: it lists Collection, Contact and WhatsApp,
  and the page behind does not overflow. Its scroll lock and Escape-to-close were not separately
  asserted.
- No real card is charged, and no gateway webhook exists.
- The order confirmation page returns HTTP 200 with a not-found body for a bad reference.
  That is Partial Prerender flushing the static shell first; worth a look if SEO or
  monitoring cares about the status code.
