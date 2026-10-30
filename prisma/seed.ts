import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";
import { seedCategories, seedProducts } from "./seed-data";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  for (const [position, category] of seedCategories.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { label: category.label, blurb: category.blurb, position },
      create: { slug: category.slug, label: category.label, blurb: category.blurb, position },
    });
  }

  const categories = await prisma.category.findMany();
  const byLabel = new Map(categories.map((category) => [category.label, category]));

  for (const [position, product] of seedProducts.entries()) {
    const category = byLabel.get(product.line);
    if (!category) throw new Error(`No category for ${product.name}`);

    const images = [product.image, ...(product.images ?? [])].filter(
      (url): url is string => Boolean(url),
    );

    const data = {
      name: product.name,
      categoryId: category.id,
      surfaces: product.surfaces.map((surface) => surface.toUpperCase() as "HOME" | "OFFICE"),
      price: product.price,
      tagline: product.tagline,
      description: product.description,
      finishes: product.finishes,
      materials: product.materials,
      dimensions: product.dimensions,
      leadTimeWeeks: product.leadTimeWeeks,
      glyph: product.glyph.toUpperCase() as
        | "SEATING"
        | "TABLE"
        | "LIGHTING"
        | "WORKSPACE"
        | "OBJECT",
      position,
    };

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...data,
        images: {
          deleteMany: {},
          create: images.map((url, imagePosition) => ({ url, position: imagePosition })),
        },
      },
      create: {
        ...data,
        slug: product.slug,
        images: { create: images.map((url, imagePosition) => ({ url, position: imagePosition })) },
      },
    });
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (email && password) {
    await prisma.adminUser.upsert({
      where: { email },
      update: { passwordHash: hashPassword(password) },
      create: { email, name: "Owner", passwordHash: hashPassword(password) },
    });
    console.log(`Admin ready for ${email}`);
  }

  console.log(
    `Seeded ${seedCategories.length} categories and ${seedProducts.length} products.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
