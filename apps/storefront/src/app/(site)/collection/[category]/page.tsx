import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CollectionBrowser } from "@/components/collection-browser";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { brand } from "@decore/core";
import { getCategories, getCategory, productsInCategory } from "@/lib/catalog";
import { breadcrumbJsonLd, collectionJsonLd, siteOgImage } from "@/lib/seo";

export const instant = false;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collection/[category]">): Promise<Metadata> {
  const category = await getCategory((await params).category);
  if (!category) return { title: "Shop", robots: { index: false, follow: false } };

  const items = await productsInCategory(category.slug);
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
  const category = await getCategory((await params).category);
  if (!category) notFound();

  const [items, categories] = await Promise.all([
    productsInCategory(category.slug),
    getCategories(),
  ]);
  const path = `/collection/${category.slug}`;
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

      <header className="page-shell pb-10 pt-8 md:pb-12 md:pt-10">
        <div className="grid items-end gap-6 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal>
              <h1 className="display-1">{category.label}</h1>
            </Reveal>
          </div>

          <Reveal delay={0.08} className="lg:col-span-5">
            <p className="max-w-[42ch] leading-relaxed text-muted">{category.blurb}</p>
          </Reveal>
        </div>
      </header>

      <div className="page-shell">
        <CollectionBrowser products={items} categories={categories} active={category.slug} />
      </div>

    </div>
  );
}
