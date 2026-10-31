import type { Metadata } from "next";
import Link from "next/link";

import { ArrowUpRightIcon, ChatIcon } from "@decore/ui";
import { JsonLd } from "@/components/json-ld";
import { CollectionBrowser } from "@/components/collection-browser";
import { Reveal } from "@/components/reveal";
import { brand } from "@decore/core";
import { getCategories, getProducts } from "@/lib/catalog";
import { collectionJsonLd, siteOgImage } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const count = (await getProducts()).length;
  const description = `${count} pieces for the office and the home, made to order in four to eight weeks and delivered across Pakistan.`;

  return {
    title: { absolute: `Shop — furniture and decor made to order in Pakistan | ${brand.name}` },
    description: `${count} pieces for the office and the home — seating, tables, lighting and decor. Made to order in four to eight weeks and delivered across Pakistan.`,
    alternates: { canonical: "/collection" },
    openGraph: {
      type: "website",
      url: "/collection",
      title: `Shop — made to order in Pakistan | ${brand.name}`,
      description,
      images: [siteOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `Shop — made to order in Pakistan | ${brand.name}`,
      description,
    },
  };
}

export default async function CollectionPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="pb-4">
      <JsonLd data={collectionJsonLd(products, { name: "The Decore shop" })} />
      <header className="page-shell pb-10 pt-8 md:pb-12 md:pt-12">
        <div className="grid items-end gap-6 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <Reveal>
              <h1 className="display-1">Every piece</h1>
            </Reveal>
          </div>

          <Reveal delay={0.08} className="lg:col-span-4">
            <p className="max-w-[38ch] leading-relaxed text-muted">
              Built to order by workshops we visit in person.
            </p>
          </Reveal>
        </div>
      </header>

      <div className="page-shell">
        <CollectionBrowser products={products} categories={categories} />
      </div>

      <section className="page-shell mt-24">
        <Reveal>
          <div className="grid items-center gap-8 rounded-2xl bg-surface px-7 py-10 md:grid-cols-12 md:px-12 md:py-14">
            <div className="md:col-span-8">
              <p className="eyebrow text-muted">Can&apos;t decide?</p>
              <h2 className="display-3 mt-4 max-w-[22ch]">
                Tell us about the room and we will narrow it down.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 md:col-span-4 md:justify-end">
              <a
                href={whatsappLink("Hello — I would like help choosing a piece.")}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                <ChatIcon className="h-4 w-4" />
                WhatsApp
              </a>
              <Link href="/contact" className="btn-outline">
                Enquire
                <ArrowUpRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
