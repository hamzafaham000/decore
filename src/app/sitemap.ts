import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";
import { products } from "@/lib/products";

/**
 * `lastModified` is left out on purpose: the catalogue is code with no per-piece
 * dates, and a timestamp would be invented. Search engines treat it as optional.
 *
 * Product images are listed so Google Images and answer engines can associate the
 * photograph with the piece, not just the page.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/collection"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/made-to-order"), changeFrequency: "yearly", priority: 0.8 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.5 },
  ];

  const pieces: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/product/${product.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
    ...(product.image ? { images: [absoluteUrl(product.image)] } : {}),
  }));

  return [...pages, ...pieces];
}
