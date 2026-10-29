import { commerce } from "@/lib/brand";

export type QuoteInput = { unitPrice: number; quantity: number };

export type Quote = {
  subtotal: number;
  deliveryFee: number;
  total: number;
  advanceDue: number;
  balanceDue: number;
};

/** Advances are collected in round thousands — nobody wires 85,500. */
function roundAdvance(amount: number): number {
  return Math.round(amount / 1000) * 1000;
}

export function quoteFor(items: QuoteInput[]): Quote {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const deliveryFee =
    subtotal === 0 || subtotal >= commerce.freeDeliveryFrom ? 0 : commerce.deliveryFee;
  const total = subtotal + deliveryFee;
  const advanceDue = roundAdvance(total * commerce.advanceRate);

  return { subtotal, deliveryFee, total, advanceDue, balanceDue: total - advanceDue };
}
