import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";
import { getCategories, getProducts } from "@/lib/catalog";
import { productImages } from "@/lib/catalog-types";

/**
 * `lastModified` is left out on purpose: the catalogue is code with no per-piece
 * dates, and a timestamp would be invented. Search engines treat it as optional.
 *
 * Product images are listed so Google Images and answer engines can associate the
 * photograph with the piece, not just the page.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/collection"), changeFrequency: "monthly", priority: 0.9 },
    ...categories.map((category) => ({
      url: absoluteUrl(`/collection/${category.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/made-to-order"), changeFrequency: "yearly", priority: 0.8 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.5 },
  ];

  const pieces: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/product/${product.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
    ...(productImages(product).length > 0
      ? { images: productImages(product).map(absoluteUrl) }
      : {}),
  }));

  return [...pages, ...pieces];
}
