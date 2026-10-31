import { revalidateTag } from "next/cache";

/**
 * Called by the dashboard after a catalogue save. The apps are separate
 * deployments, so this is the only way to expire the shop's `catalog` cache.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.headers.get("x-revalidate-secret");

  if (!secret || given !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }

  revalidateTag("catalog", "max");
  return Response.json({ ok: true });
}
