import type { MetadataRoute } from "next";

/** The dashboard is private; keep it out of every crawler. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
