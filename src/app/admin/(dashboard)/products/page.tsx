import { connection } from "next/server";

import Link from "next/link";

import { Empty, formatDate, PageHeader, Panel } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { formatPKR } from "@/lib/money";

import { setPublished } from "./actions";

export const metadata = { title: "Products" };

export const instant = false;

const filters = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "draft", label: "Drafts" },
] as const;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await connection();

  const status = (await searchParams).status ?? "all";

  const [products, live, drafts] = await Promise.all([
    prisma.product.findMany({
      where:
        status === "live" ? { published: true } : status === "draft" ? { published: false } : {},
      include: {
        category: true,
        images: { orderBy: { position: "asc" }, take: 1 },
      },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    }),
    prisma.product.count({ where: { published: true } }),
    prisma.product.count({ where: { published: false } }),
  ]);

  const counts: Record<string, number> = { all: live + drafts, live, draft: drafts };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Products"
        description="Everything in the shop. Changes appear on the storefront straight away."
        action={
          <Link href="/admin/products/new" className="btn-primary">
            Add a piece
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => {
          const active = status === filter.value;
          return (
            <Link
              key={filter.value}
              href={filter.value === "all" ? "/admin/products" : `/admin/products?status=${filter.value}`}
              className={`rounded-full px-3.5 py-2 text-xs transition-colors ${
                active
                  ? "bg-pine text-canvas"
                  : "border border-line text-muted hover:border-ink/30 hover:text-ink"
              }`}
            >
              {filter.label}
              <span className={`ml-2 tabular-nums ${active ? "text-canvas/60" : "text-muted/70"}`}>
                {counts[filter.value]}
              </span>
            </Link>
          );
        })}
      </div>

      <Panel>
        {products.length === 0 ? (
          <Empty>
            {status === "draft"
              ? "No drafts. Every piece is live."
              : "Nothing here yet. Add the first piece."}
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
                  <th className="px-5 py-3 font-medium">Piece</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 text-right font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-ink/[0.02]">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="flex items-center gap-3"
                      >
                        <span
                          aria-hidden
                          className="h-11 w-11 shrink-0 rounded-lg border border-line bg-canvas bg-cover bg-center"
                          style={
                            product.images[0]
                              ? {
                                  backgroundImage: `url("${product.images[0].url.replace(/"/g, "%22")}")`,
                                }
                              : undefined
                          }
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{product.name}</span>
                          <span className="block truncate text-xs text-muted">
                            /{product.slug}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-muted">{product.category.label}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatPKR(product.price)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          product.published ? "bg-pine-soft text-pine" : "bg-line text-muted"
                        }`}
                      >
                        {product.published ? "Live" : "Draft"}
                      </span>
                      {product.featured && (
                        <span className="ml-1.5 text-[11px] text-clay">Featured</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">
                      {formatDate(product.updatedAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <form action={setPublished}>
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            className="text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
                          >
                            {product.published ? "Unpublish" : "Publish"}
                          </button>
                        </form>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-xs font-medium underline-offset-4 hover:underline"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
