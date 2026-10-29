export const brand = {
  name: "Decore",
  tagline: "Considered pieces for work and rest.",
  description:
    "Furniture and objects for work and rest, made to order in Pakistan. Solid walnut, hand-raised brass and wool bouclé, finished by hand.",
  email: "hello@decore.pk",
  /** Public display form. `whatsappLink` still builds the wa.me URL from the env var. */
  whatsapp: "+92 316 9650686",
  country: "Pakistan",
  year: 2026,
  hours: "Monday to Saturday, 10:00 – 19:00",
  replyTime: "Within one working day",
};

export const commerce = {
  deliveryFee: 2_500,
  freeDeliveryFrom: 150_000,
  /** Per piece. The order API rejects anything above this, so steppers must not offer it. */
  maxQuantity: 10,
  /** Share of the order taken before dispatch; the rest is collected on delivery. */
  advanceRate: 0.3,
};

export const nav = [
  { href: "/collection", label: "Collection" },
  { href: "/contact", label: "Contact" },
] as const;

export const announcement = "Free delivery over PKR 150,000";
