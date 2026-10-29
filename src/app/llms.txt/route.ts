import { llmsIndex } from "@/lib/llms";

/** The short index described at https://llmstxt.org — facts first, links second. */
export function GET() {
  return new Response(llmsIndex(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
