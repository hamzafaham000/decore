import { connection } from "next/server";

import Link from "next/link";

import { PageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/db";

import { createProduct } from "../actions";
import { ProductForm } from "../product-form";

export const metadata = { title: "Add product" };

export const instant = false;

export default async function NewProductPage() {
  await connection();

  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add product"
        description="Start with the essentials. You can add photography and specification afterwards."
      />

      {categories.length === 0 ? (
        <p className="a-card px-5 py-10 text-center text-sm text-[#5e6963]">
          There are no categories yet. Run <code className="a-code">pnpm db:seed</code> once, then
          come back.
        </p>
      ) : (
        <ProductForm
          action={createProduct}
          categories={categories.map((category) => ({
            id: category.id,
            label: category.label,
          }))}
          submitLabel="Save product"
        />
      )}

      <Link href="/admin/products" className="a-btn a-btn-quiet">
        Back to products
      </Link>
    </div>
  );
}
