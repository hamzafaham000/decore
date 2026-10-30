import type { Metadata } from "next";
import Link from "next/link";

import { HeroShowcase } from "@/components/hero-showcase";
import { ArrowRightIcon, ArrowUpRightIcon, LeafIcon, SparkIcon, TruckIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { Reveal } from "@/components/reveal";
import { commerce } from "@/lib/brand";
import { formatPKR } from "@/lib/money";
import { getProduct, products } from "@/lib/products";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const principles = [
  {
    title: "Materials",
    body: "Solid walnut, wool bouclé, unlacquered brass. Nothing veneered, nothing plated.",
    icon: LeafIcon,
  },
  {
    title: "Made to order",
    body: "We build after you order. Four to eight weeks, and you hear from the workshop twice.",
    icon: SparkIcon,
  },
  {
    title: "Delivered properly",
    body: "Blanketed and hand-delivered in major cities. Insured freight elsewhere in Pakistan.",
    icon: TruckIcon,
  },
];

export default function Home() {
  const featured = getProduct("girih-linked-sculpture") ?? products[1];

  // Only pieces with photography belong on the hero stage, strongest portrait first.
  const showcase = ["suhbat-stacked-sculpture", "panah-table-sculpture", "girih-linked-sculpture"]
    .map((slug) => getProduct(slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product?.image));

  return (
    <>
      {/* Hero */}
      <section className="page-shell pt-8 md:pt-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7 lg:flex lg:flex-col">
            <Reveal>
              <p className="eyebrow flex items-center gap-3 text-muted">
                <span className="h-px w-8 bg-muted/50" />
                Office &amp; home
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="display-1 mt-7 md:mt-9">
                Fewer things,
                <br />
                <em className="text-pine">made properly.</em>
              </h1>
            </Reveal>

            <Reveal delay={0.12} className="mt-9 lg:mt-auto lg:pt-14">
              <p className="max-w-[42ch] text-base leading-relaxed text-muted md:text-lg">
                Furniture and decor for work and rest — built to order in Pakistan, finished by
                hand.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
                <Link href="/collection" className="btn-primary">
                  Explore the shop
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <a
                  href={whatsappLink("Hello — may I ask about your pieces?")}
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline text-ink"
                >
                  Talk to us
                </a>
              </div>

              <p className="mt-8 border-t border-line pt-5 text-[10px] uppercase tracking-[0.16em] text-muted">
                Made to order · 4–8 weeks
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <HeroShowcase items={showcase} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Shop */}
      <section className="page-shell py-20 md:py-28">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-muted">Selected pieces</p>
              <h2 className="display-2 mt-4">Start here</h2>
            </div>
            <div className="flex flex-col gap-4 md:items-end">
              <p className="max-w-[38ch] text-sm leading-relaxed text-muted md:text-right">
                Built to order by workshops we visit in person.
              </p>
              <Link href="/collection" className="link-underline self-start md:self-end">
                See every piece
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3 md:mt-16">
          {products.map((product, index) => (
            <Reveal key={product.slug} delay={(index % 3) * 0.06}>
              <ProductCard product={product} index={index} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Approach */}
      <section id="approach" className="border-y border-line bg-surface">
        <div className="page-shell grid gap-14 py-20 md:py-28 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow text-muted">Our approach</p>
              <h2 className="display-2 mt-4 max-w-[14ch]">The room comes first.</h2>
              <p className="mt-7 max-w-[42ch] leading-relaxed text-muted">
                A room does not need many things. It needs the right ones, and room to breathe
                around them. That is why the shop stays small and every piece is built only
                once it has a home.
              </p>
              <Link href="/contact" className="link-underline mt-8">
                Meet us
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="border-t border-line">
              {principles.map((principle, index) => {
                const Icon = principle.icon;
                return (
                  <Reveal key={principle.title} delay={index * 0.05}>
                    <div className="grid gap-5 border-b border-line py-7 sm:grid-cols-[auto_1fr] sm:gap-8 sm:py-8">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-canvas text-pine">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="flex items-baseline justify-between gap-6">
                          <h3 className="text-xl">{principle.title}</h3>
                          <span className="eyebrow text-muted">
                            0{index + 1}
                          </span>
                        </div>
                        <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-muted">
                          {principle.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured piece */}
      <section className="bg-pine text-canvas">
        <div className="page-shell grid items-center gap-10 py-16 md:py-24 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <Reveal>
              <p className="eyebrow text-canvas/70">Featured piece · {featured.line}</p>
              <h2 className="display-2 mt-4 max-w-[13ch]">{featured.tagline}</h2>
              <p className="mt-6 max-w-[44ch] leading-relaxed text-canvas/65">
                {featured.description.split(". ").slice(0, 2).join(". ")}.
              </p>

              <dl className="mt-9 grid max-w-md grid-cols-2 gap-6 border-t border-canvas/15 pt-6 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-canvas/65">Rings</dt>
                  <dd className="mt-1.5 text-canvas/85">{featured.materials[0]?.value}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-canvas/65">Height</dt>
                  <dd className="mt-1.5 text-canvas/85">{featured.dimensions[0]?.value}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-canvas/65">Price</dt>
                  <dd className="mt-1.5 tabular-nums text-canvas/85">{formatPKR(featured.price)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-canvas/65">Lead time</dt>
                  <dd className="mt-1.5 text-canvas/85">{featured.leadTimeWeeks} weeks</dd>
                </div>
              </dl>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href={`/product/${featured.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-canvas px-6 py-3.5 text-[0.8125rem] font-medium tracking-[0.06em] text-ink transition-colors hover:bg-canvas/90"
                >
                  Discover the piece
                  <ArrowUpRightIcon className="h-4 w-4" />
                </Link>
                <a
                  href={whatsappLink(`Hello — I would like to know more about the ${featured.name}.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-canvas/25 px-6 py-3.5 text-[0.8125rem] tracking-[0.06em] text-canvas transition-colors hover:border-canvas"
                >
                  Ask about it
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.08} className="order-1 lg:order-2">
            <div className="aspect-4/5 overflow-hidden rounded-2xl bg-canvas/5 lg:aspect-[10/11]">
              <ProductImage
                product={featured}
                sizes="(min-width: 1024px) 46vw, 100vw"
                framed
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Closing */}
      <section className="page-shell py-20 md:py-28">
        <div className="grid items-end gap-10 border-t border-line pt-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow text-muted">Start here</p>
            <h2 className="display-2 mt-4">
              Begin with a
              <br />
              <em className="text-pine">conversation.</em>
            </h2>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-5">
            <p className="max-w-[40ch] leading-relaxed text-muted">
              Tell us about the room, the finish, or the date it needs to arrive. We will tell you
              what is possible — and what it costs — before anything is cut.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a
                href={whatsappLink("Hello — I would like to order a piece.")}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                Order on WhatsApp
                <ArrowUpRightIcon className="h-4 w-4" />
              </a>
              <Link href="/contact" className="link-underline">
                Enquire by email
              </Link>
            </div>
            <p className="mt-7 text-xs leading-relaxed text-muted">
              Complimentary delivery over {formatPKR(commerce.freeDeliveryFrom)} · A{" "}
              {Math.round(commerce.advanceRate * 100)}% advance confirms the build.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
