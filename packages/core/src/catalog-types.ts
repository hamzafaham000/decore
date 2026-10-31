/**
 * The shape the storefront renders. Kept free of database imports so client
 * components can use it without pulling Prisma into the browser bundle.
 */
export type Surface = "home" | "office";

export type ProductGlyph = "seating" | "table" | "lighting" | "workspace" | "object";

export type Detail = { label: string; value: string };

export type Category = {
  slug: string;
  label: string;
  blurb: string;
  position: number;
};

export type Product = {
  slug: string;
  name: string;
  /** The category's display label. */
  line: string;
  categorySlug: string;
  surfaces: Surface[];
  price: number;
  tagline: string;
  description: string;
  finishes: string[];
  materials: Detail[];
  dimensions: Detail[];
  leadTimeWeeks: number;
  /** Cover photograph. Used by cards, the cart, search and Open Graph. */
  image?: string;
  /**
   * Extra views for the product gallery — detail, in-room, scale.
   * The cover is not repeated here; the gallery renders it first.
   */
  images?: string[];
  glyph: ProductGlyph;
  published: boolean;
  featured: boolean;
};

/** Every photograph for a piece, cover first. Empty when nothing is shot yet. */
export function productImages(product: Pick<Product, "image" | "images">): string[] {
  return [...(product.image ? [product.image] : []), ...(product.images ?? [])];
}
