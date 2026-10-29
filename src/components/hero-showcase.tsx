"use client";

import Link from "next/link";
import { useState } from "react";

import { ArrowUpRightIcon } from "@/components/icons";
import { ProductImage } from "@/components/product-image";
import { formatPKR } from "@/lib/money";
import type { Product } from "@/lib/products";

export type ShowcaseProduct = Pick<
  Product,
  "slug" | "name" | "price" | "finishes" | "leadTimeWeeks" | "image" | "glyph"
>;

/**
 * The hero stage. All slides stay mounted and cross-fade so switching never
 * shows a blank frame; the first piece is server-rendered and the controls
 * remain usable without JavaScript as a plain link to the active product.
 */
export function HeroShowcase({
  items,
}: {
  items: ShowcaseProduct[];
}) {
  const [active, setActive] = useState(0);

  if (items.length === 0) return null;

  const piece = items[Math.min(active, items.length - 1)];

  return (
    <div className="mx-auto w-full max-w-[26rem]">
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow text-muted">Featured piece</p>
        <p className="eyebrow tabular-nums text-muted">
          {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </p>
      </div>

      <div
        id="hero-piece"
        className="relative mt-4 aspect-5/6 overflow-hidden rounded-2xl bg-line/40"
      >
        {items.map((item, index) => (
          <div
            key={item.slug}
            aria-hidden={index !== active}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              index === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <ProductImage
              product={item}
              sizes="(min-width: 640px) 26rem, 92vw"
              priority={index === 0}
              loading={index === 0 ? undefined : "eager"}
            />
          </div>
        ))}
      </div>

      <div
        aria-live="polite"
        className="mt-5 flex min-h-[5.25rem] items-start justify-between gap-6"
      >
        <div className="min-w-0">
          <Link
            href={`/product/${piece.slug}`}
            className="group inline-flex items-baseline gap-2 font-display text-2xl leading-tight transition-colors hover:text-pine"
          >
            {piece.name}
            <ArrowUpRightIcon className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-muted transition-transform group-hover:-translate-y-0 group-hover:translate-x-0.5" />
          </Link>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            {piece.finishes[0]} · Made to order, {piece.leadTimeWeeks} weeks
          </p>
        </div>
        <p className="shrink-0 pt-1.5 text-sm tabular-nums">{formatPKR(piece.price)}</p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-5 border-t border-line pt-5">
        <div role="group" aria-label="Featured pieces" className="flex gap-2.5">
          {items.map((item, index) => (
            <button
              key={item.slug}
              type="button"
              aria-pressed={index === active}
              aria-controls="hero-piece"
              onClick={() => setActive(index)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine md:h-16 md:w-16 ${
                index === active
                  ? "border-pine ring-1 ring-pine"
                  : "border-line opacity-60 hover:opacity-100"
              }`}
            >
              <span aria-hidden className="pointer-events-none absolute inset-0">
                <ProductImage product={item} sizes="64px" compact />
              </span>
              <span className="sr-only">Show {item.name}</span>
            </button>
          ))}
        </div>

        <Link href="/collection" className="link-underline shrink-0 text-xs">
          All pieces
          <ArrowUpRightIcon className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
