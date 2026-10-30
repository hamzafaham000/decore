import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowRightIcon, ChatIcon } from "@/components/icons";
import { CollectionBrowser } from "@/components/collection-browser";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { brand } from "@/lib/brand";
import { categories, getCategory, productsInCategory } from "@/lib/products";
import { breadcrumbJsonLd, collectionJsonLd, siteOgImage } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collection/[category]">): Promise<Metadata> {
  const category = getCategory((await params).category);
  if (!category) return { title: "Shop", robots: { index: false, follow: false } };

  const items = productsInCategory(category.slug);
  const path = `/collection/${category.slug}`;
  const title = `${category.label} — made to order in Pakistan`;
  const description = `${category.blurb} ${items.length} ${
    items.length === 1 ? "piece" : "pieces"
  } built to order in Pakistan and delivered nationwide.`;

  return {
    title: { absolute: `${title} | ${brand.name}` },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: `${title} | ${brand.name}`,
      description,
      images: [siteOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${brand.name}`,
      description,
    },
  };
}

export default async function CategoryPage({ params }: PageProps<"/collection/[category]">) {
  const category = getCategory((await params).category);
  if (!category) notFound();

  const items = productsInCategory(category.slug);
  const path = `/collection/${category.slug}`;
  const others = categories.filter((candidate) => candidate.slug !== category.slug);
  const description = `${category.blurb} ${items.length} built to order in Pakistan and delivered nationwide.`;

  return (
    <div className="pb-4">
      <JsonLd
        data={collectionJsonLd(items, {
          name: `${category.label} — ${brand.name}`,
          description,
          path,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/collection" },
          { name: category.label, path },
        ])}
      />

      <div className="page-shell pt-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span aria-hidden>/</span>
          <Link href="/collection" className="transition-colors hover:text-ink">
            Shop
          </Link>
          <span aria-hidden>/</span>
          <span className="text-ink">{category.label}</span>
        </nav>
      </div>

      <header className="page-shell pb-12 pt-10 md:pb-16 md:pt-14">
        <div className="grid items-end gap-10 border-b border-line pb-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow flex items-center gap-3 text-muted">
                <span className="h-px w-8 bg-muted/50" />
                Shop
              </p>
              <h1 className="display-1 mt-7">{category.label}</h1>
            </Reveal>
          </div>

          <Reveal delay={0.08} className="lg:col-span-5">
            <p className="max-w-[46ch] leading-relaxed text-muted">{category.intro}</p>
          </Reveal>
        </div>
      </header>

      <div className="page-shell">
        <CollectionBrowser products={items} active={category.slug} />
      </div>

      <section className="page-shell mt-20">
        <div className="flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow text-muted">Keep looking</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  href={`/collection/${other.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[0.8125rem] text-muted transition-colors hover:border-ink/40 hover:text-ink"
                >
                  {other.label}
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>

          <a
            href={whatsappLink(`Hello — I would like to ask about your ${category.label.toLowerCase()}.`)}
            target="_blank"
            rel="noreferrer"
            className="btn-outline self-start md:self-auto"
          >
            <ChatIcon className="h-4 w-4" />
            Ask about a piece
          </a>
        </div>
      </section>
    </div>
  );
}
