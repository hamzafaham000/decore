/**
 * The dashboard now runs as its own app, so `updateTag` can no longer touch the
 * storefront's cached catalogue. After a save we call the storefront's
 * revalidate endpoint with a shared secret instead.
 *
 * Unset STOREFRONT_URL (or run the shop on another host without this secret)
 * and the call is skipped — the catalogue then refreshes on its own schedule.
 */
export const storefrontUrl = (process.env.STOREFRONT_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export async function invalidateCatalog(): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return;

  try {
    await fetch(`${storefrontUrl}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
      cache: "no-store",
    });
  } catch {
    // The save already went through; a failed ping must not surface as an error.
  }
}
