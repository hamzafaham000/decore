import { connection } from "next/server";

import Link from "next/link";

import { Empty, formatDate, PageHeader, Panel } from "@/components/admin/ui";
import { prisma } from "@decore/db";
import { formatPKR } from "@decore/core";

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
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Everything in the shop. Changes appear on the storefront straight away."
        action={
          <Link href="/admin/products/new" className="a-btn a-btn-primary">
            Add product
          </Link>
        }
      />

      <div className="a-segment">
        {filters.map((filter) => {
          const active = status === filter.value;
          return (
            <Link
              key={filter.value}
              href={filter.value === "all" ? "/admin/products" : `/admin/products?status=${filter.value}`}
              aria-current={active ? "page" : undefined}
            >
              {filter.label}
              <span className={`tabular-nums ${active ? "opacity-55" : "opacity-70"}`}>
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
              ? "No drafts. Every product is live."
              : "Nothing here yet. Add the first product."}
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="a-table min-w-[46rem]">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th className="num">Price</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th className="num">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="flex items-center gap-3"
                      >
                        <span
                          aria-hidden
                          className="h-9 w-9 shrink-0 rounded-md border border-[#e2e7e3] bg-[#f3f5f3] bg-cover bg-center"
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
                          <span className="a-code block truncate text-[#657069]">
                            /{product.slug}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="text-[#5e6963]">{product.category.label}</td>
                    <td className="num">{formatPKR(product.price)}</td>
                    <td>
                      <span className={product.published ? "a-pill a-pill-ok" : "a-pill a-pill-neutral"}>
                        {product.published ? "Live" : "Draft"}
                      </span>
                      {product.featured && (
                        <span className="ml-1.5 text-[10px] font-medium text-[#a9543a]">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="text-xs text-[#657069]">{formatDate(product.updatedAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <form action={setPublished}>
                          <input type="hidden" name="id" value={product.id} />
                          <button type="submit" className="a-btn a-btn-quiet a-btn-sm">
                            {product.published ? "Unpublish" : "Publish"}
                          </button>
                        </form>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="a-btn a-btn-secondary a-btn-sm"
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
