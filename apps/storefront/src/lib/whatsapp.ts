/** Server-only: reads the business number from the environment so it never lands in a client bundle. */
export function whatsappLink(message: string): string {
  const number = (process.env.WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
