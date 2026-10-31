import { connection } from "next/server";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { PageHeader, Panel } from "@/components/admin/ui";
import { ArrowUpRightIcon } from "@decore/ui";
import { prisma } from "@decore/db";

import { deleteProduct, updateProduct } from "../actions";
import { ProductForm } from "../product-form";

export const metadata = { title: "Edit product" };

export const instant = false;

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; created?: string }>;
}) {
  await connection();

  const { id } = await params;
  const notice = await searchParams;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { position: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={`Last saved ${new Intl.DateTimeFormat("en-PK", {
          day: "numeric",
          month: "long",
          hour: "numeric",
          minute: "2-digit",
        }).format(product.updatedAt)}`}
        action={
          product.published ? (
            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className="a-btn a-btn-secondary"
            >
              View on shop
              <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          ) : (
            <span className="a-pill a-pill-neutral">Draft, not on the shop</span>
          )
        }
      />

      {(notice.saved || notice.created) && (
        <p
          role="status"
          className="rounded-lg border border-[#cfe0d7] bg-[#e8f0ec] px-4 py-3 text-sm text-[#1f513f]"
        >
          {notice.created ? "Product created." : "Changes saved."} The shop is up to date.
        </p>
      )}

      <ProductForm
        action={updateProduct}
        categories={categories.map((category) => ({
          id: category.id,
          label: category.label,
        }))}
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          categoryId: product.categoryId,
          price: product.price,
          tagline: product.tagline,
          description: product.description,
          finishes: product.finishes,
          materials: product.materials as { label: string; value: string }[],
          dimensions: product.dimensions as { label: string; value: string }[],
          leadTimeWeeks: product.leadTimeWeeks,
          glyph: product.glyph.toLowerCase(),
          surfaces: product.surfaces.map((surface) => surface.toLowerCase()),
          published: product.published,
          featured: product.featured,
          position: product.position,
          images: product.images.map((image) => image.url),
        }}
        submitLabel="Save changes"
      />

      <Panel title="Remove this product" className="a-card-danger">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <p className="max-w-md text-xs leading-relaxed text-[#5e6963]">
            Deleting removes the product from the shop and from every link to it. Orders already
            placed keep their record.
          </p>
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <ConfirmSubmit
              message={`Delete ${product.name}? This cannot be undone.`}
              className="a-btn a-btn-danger"
            >
              Delete product
            </ConfirmSubmit>
          </form>
        </div>
      </Panel>
    </div>
  );
}
