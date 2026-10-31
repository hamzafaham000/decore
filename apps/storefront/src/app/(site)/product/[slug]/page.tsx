import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Accordion } from "@/components/accordion";
import { AddToCart } from "@/components/add-to-cart";
import { ArrowUpRightIcon, ChatIcon } from "@decore/ui";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { brand, commerce } from "@decore/core";
import { formatPKR } from "@decore/core";
import { getProduct, getProducts } from "@/lib/catalog";
import type { Surface } from "@decore/core";
import { productJsonLd, categoryOf } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const instant = false;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "Piece not found", robots: { index: false, follow: false } };

  const path = `/product/${product.slug}`;
  const title = `${product.name} — ${product.line}, made to order`;
  const description = `${product.tagline} ${formatPKR(product.price)}, made to order in ${
    product.leadTimeWeeks
  } weeks and delivered across Pakistan.`;

  return {
    title: { absolute: `${title} | ${brand.name}` },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: `${title} | ${brand.name}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${brand.name}`,
      description,
    },
  };
}

function surfaceCopy(surfaces: Surface[]) {
  if (surfaces.length > 1) return "For the home and the office";
  return surfaces[0] === "office" ? "For the office" : "For the home";
}

function SpecList({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="space-y-2.5">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-6">
          <dt className="text-muted">{row.label}</dt>
          <dd className="text-right text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const products = await getProducts();
  const index = products.findIndex((candidate) => candidate.slug === product.slug);
  const neighbours = [...products.slice(index + 1), ...products.slice(0, index)];
  const others = neighbours.slice(0, 3);
  const care = product.materials.find((material) => material.label === "Care")?.value;

  return (
    <>
      <JsonLd data={productJsonLd(product)} />

      <div className="page-shell pb-20 pt-6 md:pt-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span aria-hidden>/</span>
          <Link href="/collection" className="transition-colors hover:text-ink">
            Shop
          </Link>
          {categoryOf(product) && (
            <>
              <span aria-hidden>/</span>
              <Link
                href={`/collection/${categoryOf(product)!.slug}`}
                className="transition-colors hover:text-ink"
              >
                {categoryOf(product)!.label}
              </Link>
            </>
          )}
          <span aria-hidden>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-x-14 gap-y-12 lg:grid-cols-[1.08fr_0.92fr] lg:mt-9">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductGallery product={product} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
              <span>{product.line}</span>
              <span>{surfaceCopy(product.surfaces)}</span>
            </div>
          </div>

          <div className="lg:py-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-pine" />
                Made to order
              </span>
              <span className="eyebrow text-muted">{product.line}</span>
            </div>

            <h1 className="display-2 mt-5 max-w-[16ch]">{product.name}</h1>
            <p className="mt-4 max-w-[38ch] text-lg leading-relaxed text-muted">
              {product.tagline}
            </p>

            <div className="mt-7 flex items-baseline gap-4 border-b border-line pb-6">
              <p className="text-xl font-medium tabular-nums">{formatPKR(product.price)}</p>
              <p className="text-xs text-muted">inclusive of all taxes</p>
            </div>

            <AddToCart product={product} />

            <p className="mt-9 max-w-[52ch] leading-relaxed text-muted">{product.description}</p>

            <div className="mt-8">
              <Accordion
                items={[
                  {
                    title: "Materials & making",
                    content: <SpecList rows={product.materials} />,
                  },
                  {
                    title: "Dimensions",
                    content: <SpecList rows={product.dimensions} />,
                  },
                  {
                    title: "Delivery",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Built to order in about {product.leadTimeWeeks} weeks from confirmation.
                          We confirm every order by hand before a workshop starts.
                        </p>
                        <p>
                          Blanketed and hand-delivered in major cities; elsewhere in Pakistan by
                          insured freight. Delivery is complimentary over{" "}
                          {formatPKR(commerce.freeDeliveryFrom)}, otherwise{" "}
                          {formatPKR(commerce.deliveryFee)}.
                        </p>
                        <p>
                          A {Math.round(commerce.advanceRate * 100)}% advance confirms the build;
                          the balance is collected on delivery.
                        </p>
                        <p>
                          <Link href="/made-to-order" className="link-underline">
                            How made-to-order works
                          </Link>
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Care",
                    content: (
                      <p>
                        {care ??
                          "Care instructions travel with the piece. Treat it as furniture, not a showpiece — dust with a dry cloth and keep it out of direct sun."}
                      </p>
                    ),
                  },
                ]}
              />
            </div>

            <a
              href={whatsappLink(
                `Hello — I have a question about the ${product.name} (${formatPKR(product.price)}).`,
              )}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
            >
              <ChatIcon className="h-4 w-4" />
              Ask about this piece on WhatsApp
            </a>
          </div>
        </div>
      </div>

      <section className="border-t border-line bg-surface">
        <div className="page-shell py-16 md:py-24">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="eyebrow text-muted">Keep looking</p>
              <h2 className="display-3 mt-3">More from the shop</h2>
            </div>
            <Link href="/collection" className="link-underline self-start md:self-auto">
              View all pieces
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 md:mt-14">
            {others.map((other) => (
              <ProductCard key={other.slug} product={other} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
