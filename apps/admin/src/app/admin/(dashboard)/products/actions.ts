"use server";

import { redirect } from "next/navigation";

import type { Detail } from "@decore/core";
import { requireAdmin } from "@decore/auth";
import { prisma } from "@decore/db";

import { invalidateCatalog } from "@/lib/storefront";

export type ProductFormState = {
  error?: string;
  /** Which part of the form to open again, when the server rejects a field. */
  field?: string;
};

const glyphs = ["SEATING", "TABLE", "LIGHTING", "WORKSPACE", "OBJECT"] as const;
type Glyph = (typeof glyphs)[number];

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function whole(formData: FormData, key: string, fallback = 0) {
  const value = Number.parseInt(text(formData, key), 10);
  return Number.isFinite(value) ? value : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** "Frame: Solid walnut" per line. The first colon separates the two. */
function readDetails(formData: FormData, key: string): Detail[] {
  return text(formData, key)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const separator = line.indexOf(":");
      if (separator < 1) return [];
      const label = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      return label && value ? [{ label, value }] : [];
    });
}

function readLines(formData: FormData, key: string) {
  return text(formData, key)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function readImages(formData: FormData) {
  return formData
    .getAll("image")
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0 && value.length <= 500)
    .slice(0, 12);
}

async function uniqueSlug(value: string, excludeId?: string) {
  const root = slugify(value) || `piece-${Date.now().toString(36).slice(-4)}`;
  let candidate = root;
  let suffix = 2;

  for (;;) {
    const clash = await prisma.product.findFirst({
      where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!clash) return candidate;
    candidate = `${root}-${suffix++}`;
  }
}

async function readProduct(formData: FormData) {
  const name = text(formData, "name");
  const categoryId = text(formData, "categoryId");
  const price = whole(formData, "price");
  const tagline = text(formData, "tagline");
  const description = text(formData, "description");

  if (!name) return { error: "Give the piece a name.", field: "name" } as const;
  if (!categoryId) return { error: "Choose a category.", field: "category" } as const;
  if (price <= 0) return { error: "Set a price in whole rupees.", field: "price" } as const;
  if (!tagline) return { error: "Add the one-line tagline.", field: "tagline" } as const;
  if (!description) return { error: "Add the description.", field: "description" } as const;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "That category no longer exists.", field: "categoryId" } as const;

  const glyphValue = text(formData, "glyph").toUpperCase();
  const glyph = (glyphs as readonly string[]).includes(glyphValue)
    ? (glyphValue as Glyph)
    : "OBJECT";

  const surfaces = formData
    .getAll("surface")
    .map((value) => String(value).toUpperCase())
    .filter((value): value is "HOME" | "OFFICE" => value === "HOME" || value === "OFFICE");

  return {
    value: {
      name,
      slugInput: text(formData, "slug"),
      categoryId,
      price,
      tagline,
      description,
      leadTimeWeeks: Math.min(Math.max(whole(formData, "leadTimeWeeks", 4), 1), 52),
      position: Math.max(whole(formData, "position"), 0),
      glyph,
      surfaces: surfaces.length ? surfaces : (["HOME"] as const),
      finishes: readLines(formData, "finishes"),
      materials: readDetails(formData, "materials"),
      dimensions: readDetails(formData, "dimensions"),
      images: readImages(formData),
      published: formData.get("published") === "on",
      featured: formData.get("featured") === "on",
    },
  } as const;
}

async function catalogueChanged() {
  // The shop is a separate app now; ask it to expire its cached catalogue.
  await invalidateCatalog();
}

export async function createProduct(
  _previous: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = await readProduct(formData);
  if ("error" in parsed) return { error: parsed.error, field: parsed.field };

  const { slugInput, surfaces, images, ...data } = parsed.value;

  const product = await prisma.product.create({
    data: {
      ...data,
      slug: await uniqueSlug(slugInput || data.name),
      surfaces: [...surfaces],
      images: { create: images.map((url, position) => ({ url, position })) },
    },
  });

  await catalogueChanged();
  redirect(`/admin/products/${product.id}?created=1`);
}

export async function updateProduct(
  _previous: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const id = text(formData, "id");
  if (!id) return { error: "That piece could not be found." };

  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return { error: "That piece has been deleted. Reload the list." };

  const parsed = await readProduct(formData);
  if ("error" in parsed) return { error: parsed.error, field: parsed.field };

  const { slugInput, surfaces, images, ...data } = parsed.value;

  await prisma.product.update({
    where: { id },
    data: {
      ...data,
      slug: await uniqueSlug(slugInput || data.name, id),
      surfaces: [...surfaces],
      images: {
        deleteMany: {},
        create: images.map((url, position) => ({ url, position })),
      },
    },
  });

  await catalogueChanged();
  redirect(`/admin/products/${id}?saved=1`);
}

/** Used by the publish switch in the product list. */
export async function setPublished(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  if (!id) return;

  const product = await prisma.product.findUnique({ where: { id }, select: { published: true } });
  if (!product) return;

  await prisma.product.update({ where: { id }, data: { published: !product.published } });
  await catalogueChanged();
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const id = text(formData, "id");
  if (!id) return;

  await prisma.product.delete({ where: { id } }).catch(() => undefined);
  await catalogueChanged();
  redirect("/admin/products");
}
