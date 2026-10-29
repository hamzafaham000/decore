/**
 * The seam for card payments. Stripe and Shopify Payments do not operate in
 * Pakistan, so this is where a local gateway — Safepay, XPay, PayPro, or bank
 * acquiring — creates the advance charge once an account is approved.
 *
 * Until then every card order is recorded and left awaiting a manual link.
 *
 * Stays async so the real call drops in without touching the route handler;
 * the order reference and advance amount come back as arguments at that point.
 */
export async function createAdvancePayment(): Promise<{ redirectUrl: string | null }> {
  return { redirectUrl: null };
}
