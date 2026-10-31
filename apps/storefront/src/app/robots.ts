import type { MetadataRoute } from "next";

import { absoluteUrl } from "@decore/core";

/**
 * The cart, checkout and receipt hold one buyer's details — they are never for crawlers.
 *
 * Answer engines are named explicitly. `*` already allows them, but a named group is
 * how an operator confirms the intent, and it survives a future `*` tightening.
 */
const answerEngines = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/checkout", "/order", "/api"],
      },
      ...answerEngines.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/checkout", "/order", "/api"],
      })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
