import { brand, commerce } from "@decore/core";
import { formatPKR } from "@decore/core";
import { productImages, type Product } from "@decore/core";
import { absoluteUrl, siteLanguage, siteUrl } from "@decore/core";

/**
 * One place for every JSON-LD node. The ids are stable so pages can reference the
 * organisation instead of repeating it, which is what lets search engines and AI
 * answer engines treat the catalogue as one entity rather than six islands.
 */
export const organizationId = `${siteUrl}/#organization`;
export const websiteId = `${siteUrl}/#website`;

/**
 * Pages that set their own `openGraph` object replace the layout's, including the
 * image injected by app/opengraph-image.tsx. They include this so the card is never
 * missing on a share. Served by the file convention at /opengraph-image.
 */
export const siteOgImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Decore — furniture and decor, made to order in Pakistan",
};

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: brand.name,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/icon.svg"),
        image: absoluteUrl("/icon.svg"),
        description: brand.description,
        slogan: brand.tagline,
        email: brand.email,
        areaServed: { "@type": "Country", name: brand.country },
        knowsAbout: [
          "made-to-order furniture",
          "solid walnut furniture",
          "hand-raised brass lighting",
          "wool bouclé upholstery",
          "home decor",
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone: brand.whatsapp,
            email: brand.email,
            areaServed: "PK",
            availableLanguage: ["en", "ur"],
            hoursAvailable: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "10:00",
              closes: "19:00",
            },
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: absoluteUrl("/"),
        name: brand.name,
        description: brand.description,
        inLanguage: siteLanguage,
        publisher: { "@id": organizationId },
      },
    ],
  };
}

/** The shop category a piece belongs to. */
export function categoryOf(product: Product) {
  return { slug: product.categorySlug, label: product.line };
}

export function productJsonLd(product: Product) {  const url = absoluteUrl(`/product/${product.slug}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: product.name,
        description: product.description,
        url,
        ...(productImages(product).length > 0
          ? { image: productImages(product).map(absoluteUrl) }
          : {}),
        brand: { "@type": "Brand", name: brand.name },
        category: `${product.line} · furniture and decor`,
        material: product.materials
          .filter((material) => material.label !== "Care")
          .map((material) => material.value)
          .join("; "),
        additionalProperty: [
          ...product.dimensions.map((dimension) => ({
            "@type": "PropertyValue",
            name: dimension.label,
            value: dimension.value,
          })),
          ...product.finishes.map((finish) => ({
            "@type": "PropertyValue",
            name: "Finish",
            value: finish,
          })),
        ],
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "PKR",
          price: product.price,
          availability: "https://schema.org/MadeToOrder",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@id": organizationId },
          areaServed: { "@type": "Country", name: brand.country },
          deliveryLeadTime: {
            "@type": "QuantitativeValue",
            value: product.leadTimeWeeks,
            unitCode: "WEE",
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          {
            "@type": "ListItem",
            position: 2,
            name: "Shop",
            item: absoluteUrl("/collection"),
          },
          ...(categoryOf(product)
            ? [
                {
                  "@type": "ListItem",
                  position: 3,
                  name: categoryOf(product)!.label,
                  item: absoluteUrl(`/collection/${categoryOf(product)!.slug}`),
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: categoryOf(product) ? 4 : 3,
            name: product.name,
            item: url,
          },
        ],
      },
    ],
  };
}

export function collectionJsonLd(
  products: Product[],
  options: { name?: string; description?: string; path?: string } = {},
) {
  const url = absoluteUrl(options.path ?? "/collection");
  const name = options.name ?? "The Decore shop";

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name,
    description:
      options.description ??
      `${products.length} furniture and home pieces, made to order in Pakistan and delivered nationwide.`,
    inLanguage: siteLanguage,
    isPartOf: { "@id": websiteId },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/product/${product.slug}`),
        name: product.name,
      })),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export type Faq = { title: string; content: string };
function faqNode(faqs: Faq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.title,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.content,
      },
    })),
  };
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    ...faqNode(faqs),
  };
}

export function madeToOrderJsonLd(faqs: Faq[]) {
  const url = absoluteUrl("/made-to-order");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: "Made to order in Pakistan",
        description:
          "How Decore pieces are made: four to eight weeks, a 30% advance, hand delivery across Pakistan, and what happens after you order.",
        inLanguage: siteLanguage,
        isPartOf: { "@id": websiteId },
        about: { "@id": organizationId },
      },
      faqNode(faqs),
    ],
  };
}

/** Shared copy so metadata, llms.txt and the visible FAQ cannot drift apart. */
export const madeToOrderFaqs: Faq[] = [
  {
    title: "How long does a made-to-order piece take?",
    content:
      "Four to eight weeks from the day we confirm the order. The exact window is on each product page: four weeks for lighting and decor, six for seating, eight for the writing desk.",
  },
  {
    title: "Do you deliver across Pakistan?",
    content: `Yes. Pieces are blanketed and hand-delivered in major cities, and travel by insured freight elsewhere in Pakistan. Delivery is complimentary over ${formatPKR(commerce.freeDeliveryFrom)}, otherwise a flat ${formatPKR(commerce.deliveryFee)} is added at checkout.`,
  },
  {
    title: "How does payment work?",
    content: `A ${Math.round(commerce.advanceRate * 100)}% advance confirms the build. The balance is collected when the piece is delivered. Nothing is charged when you place the order online — we confirm the order by hand first.`,
  },
  {
    title: "Can I choose a finish?",
    content:
      "Every piece is offered in two or three finishes, shown on its product page with a swatch. Finish samples can be arranged by appointment before the build starts.",
  },
  {
    title: "Can I cancel an order?",
    content:
      "An order can be cancelled without charge before the workshop cuts the timber. After that, the advance covers material already committed to your piece.",
  },
];
