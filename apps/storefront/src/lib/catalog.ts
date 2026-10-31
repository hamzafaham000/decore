import { cacheLife, cacheTag } from "next/cache";

import type {
  CategoryModel,
  ProductImageModel,
  ProductModel,
} from "@decore/db";
import { prisma } from "@decore/db";
import type {
  Category,
  Detail,
  Product,
  ProductGlyph,
  Surface,
} from "@decore/core";

type ProductRow = ProductModel & {
  category: CategoryModel;
  images: ProductImageModel[];
};

const glyphLabels: Record<string, ProductGlyph> = {
  SEATING: "seating",
  TABLE: "table",
  LIGHTING: "lighting",
  WORKSPACE: "workspace",
  OBJECT: "object",
};

const surfaceLabels: Record<string, Surface> = {
  HOME: "home",
  OFFICE: "office",
};

/** JSON columns are written through the admin, so read them defensively. */
export function readDetails(value: unknown): Detail[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (
      entry &&
      typeof entry === "object" &&
      "label" in entry &&
      "value" in entry &&
      typeof entry.label === "string" &&
      typeof entry.value === "string"
    ) {
      return [{ label: entry.label, value: entry.value }];
    }
    return [];
  });
}

function toProduct(row: ProductRow): Product {
  const [cover, ...rest] = row.images;
  const category = row.category;

  return {
    slug: row.slug,
    name: row.name,
    line: category.label,
    categorySlug: category.slug,
    surfaces: row.surfaces.map((surface) => surfaceLabels[surface] ?? "home"),
    price: row.price,
    tagline: row.tagline,
    description: row.description,
    finishes: row.finishes,
    materials: readDetails(row.materials),
    dimensions: readDetails(row.dimensions),
    leadTimeWeeks: row.leadTimeWeeks,
    image: cover?.url,
    images: rest.length ? rest.map((image) => image.url) : undefined,
    glyph: glyphLabels[row.glyph] ?? "object",
    published: row.published,
    featured: row.featured,
  };
}

const withCatalog = {
  category: true,
  images: { orderBy: { position: "asc" as const } },
} as const;

/**
 * Everything the shop renders, cached until an admin save invalidates the
 * `catalog` tag. Drafts never leave the dashboard.
 */
export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheTag("catalog");
  cacheLife("max");

  const rows = await prisma.product.findMany({
    where: { published: true },
    include: withCatalog,
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });

  return rows.map(toProduct);
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag("catalog");
  cacheLife("max");

  const rows = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { label: "asc" }],
  });

  return rows.map((row) => ({
    slug: row.slug,
    label: row.label,
    blurb: row.blurb,
    position: row.position,
  }));
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheTag("catalog");
  cacheLife("max");

  const row = await prisma.product.findFirst({
    where: { slug, published: true },
    include: withCatalog,
  });

  return row ? toProduct(row) : undefined;
}

export async function productsInCategory(slug: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.categorySlug === slug);
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug);
}

export async function getFeatured(): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((product) => product.featured);
}
