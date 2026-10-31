/**
 * The absolute base for metadata, the sitemap and structured data. Search engines
 * and AI crawlers need fully qualified URLs, and there is no way to infer the
 * production host at build time — set SITE_URL in the environment.
 *
 * The fallback matters: if a production deploy forgets SITE_URL, canonicals must
 * still point at the real store, not localhost. Localhost is only the dev default.
 */
const fallback = process.env.NODE_ENV === "production" ? "https://decore.pk" : "http://localhost:3000";

export const siteUrl = (process.env.SITE_URL ?? fallback).replace(/\/$/, "");

/** Open Graph uses underscores, `<html lang>` uses a hyphen. */
export const siteLocale = "en_PK";
export const siteLanguage = "en-PK";

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
