import { brand, commerce } from "@/lib/brand";
import { formatPKR } from "@/lib/money";
import { products } from "@/lib/products";
import { madeToOrderFaqs } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

/**
 * Two plain-text surfaces for answer engines:
 * `/llms.txt` is the short index; `/llms-full.txt` carries the catalogue detail.
 * Everything here is derived from the same data the pages render, so a price or
 * lead time can never be quoted out of date.
 */
const generated = new Date().toISOString().slice(0, 10);

function productDetail(slug: string): string {
  const product = products.find((candidate) => candidate.slug === slug);
  if (!product) return "";

  return [
    `### ${product.name}`,
    `URL: ${absoluteUrl(`/product/${product.slug}`)}`,
    `Line: ${product.line}`,
    `Price: ${formatPKR(product.price)}`,
    `Lead time: ${product.leadTimeWeeks} weeks from confirmation`,
    `Finishes: ${product.finishes.join(", ")}`,
    `Materials: ${product.materials.map((material) => `${material.label} — ${material.value}`).join("; ")}`,
    `Dimensions: ${product.dimensions.map((dimension) => `${dimension.label} ${dimension.value}`).join("; ")}`,
    `Description: ${product.description}`,
  ].join("\n");
}

export function llmsIndex(): string {
  return [
    `# ${brand.name}`,
    "",
    `> ${brand.description}`,
    "",
    "Decore is a furniture and home-objects brand in Pakistan. The collection is deliberately short: seating, workspace, lighting and objects. Every piece is made to order, not held in stock.",
    "",
    "## Key facts",
    "",
    `- Made to order in Pakistan; lead time four to eight weeks from confirmation.`,
    `- ${Math.round(commerce.advanceRate * 100)}% advance confirms the build; the balance is collected on delivery.`,
    `- Delivery across Pakistan: hand-delivered in major cities, insured freight elsewhere.`,
    `- Delivery is complimentary over ${formatPKR(commerce.freeDeliveryFrom)}; otherwise ${formatPKR(commerce.deliveryFee)}.`,
    `- Prices are in Pakistani Rupees (PKR) and include all taxes.`,
    `- Contact: WhatsApp ${brand.whatsapp}, email ${brand.email}. ${brand.hours}.`,
    "",
    "## Pages",
    "",
    `- [Collection](${absoluteUrl("/collection")}): all pieces, prices and lead times.`,
    `- [Made to order](${absoluteUrl("/made-to-order")}): the process, timeline, payment and delivery.`,
    `- [Contact](${absoluteUrl("/contact")}): WhatsApp, email and frequently asked questions.`,
    "",
    "## Pieces",
    "",
    ...products.map(
      (product) =>
        `- [${product.name}](${absoluteUrl(`/product/${product.slug}`)}): ${product.tagline} ${formatPKR(product.price)}, made to order in ${product.leadTimeWeeks} weeks.`,
    ),
    "",
    "## Questions",
    "",
    ...madeToOrderFaqs.map((faq) => `- ${faq.title} ${faq.content}`),
    "",
    `Generated ${generated}. Machine-readable detail: ${absoluteUrl("/llms-full.txt")}`,
    "",
  ].join("\n");
}

export function llmsFull(): string {
  return [
    `# ${brand.name} — full catalogue`,
    "",
    `> ${brand.description}`,
    "",
    `Contact: WhatsApp ${brand.whatsapp} · ${brand.email} · ${brand.hours} · ${brand.replyTime}.`,
    `Currency: PKR. Prices include all taxes. Advance: ${Math.round(commerce.advanceRate * 100)}%.`,
    `Delivery: across Pakistan; complimentary over ${formatPKR(commerce.freeDeliveryFrom)}, otherwise ${formatPKR(commerce.deliveryFee)}.`,
    "",
    "## Catalogue",
    "",
    ...products.map((product) => productDetail(product.slug) + "\n"),
    "## Process",
    "",
    "- Orders are confirmed by hand before a workshop starts.",
    "- Lead time runs from confirmation, not from the online order.",
    "- Pieces can be cancelled without charge before the workshop cuts the timber.",
    "- Finish samples can be arranged by appointment before the build.",
    "- The collection is not custom-sized; dimensions on each product page are final.",
    "",
    "## Questions and answers",
    "",
    ...madeToOrderFaqs.map((faq) => `### ${faq.title}\n${faq.content}\n`),
    `Generated ${generated}. Short index: ${absoluteUrl("/llms.txt")}`,
    "",
  ].join("\n");
}
