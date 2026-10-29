export type CheckoutMethodId = "CARD" | "COD" | "WHATSAPP";

export type CheckoutMethodCopy = {
  id: CheckoutMethodId;
  label: string;
  blurb: string;
  /** Shown on the confirmation page as "what happens next". */
  nextStep: string;
};

export const checkoutMethods: CheckoutMethodCopy[] = [
  {
    id: "CARD",
    label: "Card",
    blurb: "Pay the advance by card. The balance is taken when your piece is built.",
    nextStep:
      "We email a payment link for the advance. The build starts as soon as it clears.",
  },
  {
    id: "COD",
    label: "Advance, then cash on delivery",
    blurb: "Confirm with a bank transfer or Raast. Pay the rest when the piece arrives.",
    nextStep:
      "We send the advance details by WhatsApp. The workshop starts once it is received, and the balance is collected at delivery.",
  },
  {
    id: "WHATSAPP",
    label: "Order on WhatsApp",
    blurb: "Send us the selection and we confirm availability with you.",
    nextStep:
      "We reply on WhatsApp to confirm the finish, the room it is going into, and a delivery date.",
  },
];

export function getCheckoutMethod(id: string): CheckoutMethodCopy | undefined {
  return checkoutMethods.find((method) => method.id === id);
}
