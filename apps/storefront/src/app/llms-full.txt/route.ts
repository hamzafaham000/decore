import { llmsFull } from "@/lib/llms";

/** The expanded catalogue for answer engines that want the whole detail. */
export async function GET() {
  return new Response(await llmsFull(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
