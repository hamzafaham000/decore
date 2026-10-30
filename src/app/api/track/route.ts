import { prisma } from "@/lib/db";

/**
 * First-party page view beacon. Written by the browser on every storefront
 * navigation, read only in /admin/analytics. Bots are ignored, and nothing
 * personal is stored — the visitor id is a random number kept in localStorage.
 */
export async function POST(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || /bot|crawler|spider|preview|headless/i.test(userAgent)) {
    return new Response(null, { status: 204 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Expected an object." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const path = typeof payload.path === "string" ? payload.path.slice(0, 300) : "";

  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) {
    return new Response(null, { status: 204 });
  }

  const referrer =
    typeof payload.referrer === "string" && payload.referrer.length > 0
      ? payload.referrer.slice(0, 300)
      : null;
  const visitor =
    typeof payload.visitor === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(payload.visitor)
      ? payload.visitor
      : null;

  const device = /ipad|tablet/i.test(userAgent)
    ? "Tablet"
    : /mobile|android|iphone/i.test(userAgent)
      ? "Mobile"
      : "Desktop";

  await prisma.pageView.create({
    data: {
      path,
      referrer,
      visitor,
      device,
      country: request.headers.get("x-vercel-ip-country")?.slice(0, 2) ?? null,
    },
  });

  return new Response(null, { status: 204 });
}
