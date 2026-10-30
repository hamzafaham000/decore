import Link from "next/link";

import { ArrowUpRightIcon } from "@/components/icons";
import { ProductImage } from "@/components/product-image";
import { formatPKR } from "@/lib/money";
import type { Product } from "@/lib/products";

export function ProductCard({
  product,
  index,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
  headingLevel = "h3",
}: {
  product: Product;
  index?: number;
  priority?: boolean;
  sizes?: string;
  /** Cards sit under an h1 on the shop page, so they use h2 there. */
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-line/40">
        <div className="h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
          <ProductImage
            product={product}
            sizes={sizes}
            priority={priority}
            alt={`${product.name} — ${product.tagline}`}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-ink/25 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="rounded-full bg-canvas/95 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-ink">
            View piece
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas/95 text-ink">
            <ArrowUpRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            {typeof index === "number" && (
              <span className="eyebrow shrink-0 text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
            )}
            <Heading className="truncate text-[1.3rem] leading-tight tracking-[-0.01em]">
              {product.name}
            </Heading>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {product.line} · {product.finishes.length} finishes
          </p>
        </div>

        <p className="shrink-0 pt-1 text-sm font-medium tabular-nums">{formatPKR(product.price)}</p>
      </div>
    </Link>
  );
}
