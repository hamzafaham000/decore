"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ChevronDownIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { easeOutExpo } from "@/lib/motion";
import type { CategorySlug, Product, Surface } from "@/lib/products";
import { categories } from "@/lib/products";

type SurfaceFilter = "all" | Surface;
type PriceBand = "any" | "under" | "mid" | "over";

const surfaceLabels: Record<SurfaceFilter, string> = {
  all: "Every room",
  home: "Home",
  office: "Office",
};

const priceLabels: Record<PriceBand, string> = {
  any: "Any price",
  under: "Under 100k",
  mid: "100k – 200k",
  over: "Over 200k",
};

function inBand(price: number, band: PriceBand) {
  if (band === "under") return price < 100_000;
  if (band === "mid") return price >= 100_000 && price <= 200_000;
  if (band === "over") return price > 200_000;
  return true;
}

export function CollectionBrowser({
  products,
  active,
}: {
  products: Product[];
  /** The category this page represents. Omit on the all-pieces page. */
  active?: CategorySlug;
}) {
  const [surface, setSurface] = useState<SurfaceFilter>("all");
  const [band, setBand] = useState<PriceBand>("any");

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (surface === "all" || product.surfaces.includes(surface)) &&
          inBand(product.price, band),
      ),
    [products, surface, band],
  );

  const isFiltered = surface !== "all" || band !== "any";

  function clear() {
    setSurface("all");
    setBand("any");
  }

  return (
    <div>
      <div className="sticky top-[4.5rem] z-30 -mx-[clamp(1.25rem,4vw,4rem)] border-y border-line bg-canvas/90 px-[clamp(1.25rem,4vw,4rem)] backdrop-blur-md md:top-20">
        <div className="flex flex-col gap-3 py-4">
          <nav aria-label="Shop categories">
            <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <li className="shrink-0">
                <Link
                  href="/collection"
                  aria-current={active ? undefined : "page"}
                  className={`inline-flex shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[0.8125rem] transition-colors ${
                    active
                      ? "border-line bg-surface text-muted hover:border-ink/40 hover:text-ink"
                      : "border-pine bg-pine text-canvas"
                  }`}
                >
                  All pieces
                </Link>
              </li>
              {categories.map((category) => {
                const current = category.slug === active;
                return (
                  <li key={category.slug} className="shrink-0">
                    <Link
                      href={`/collection/${category.slug}`}
                      aria-current={current ? "page" : undefined}
                      className={`inline-flex shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[0.8125rem] transition-colors ${
                        current
                          ? "border-pine bg-pine text-canvas"
                          : "border-line bg-surface text-muted hover:border-ink/40 hover:text-ink"
                      }`}
                    >
                      {category.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                aria-label="Filter by room"
                value={surface}
                onChange={(event) => setSurface(event.target.value as SurfaceFilter)}
                className={`appearance-none rounded-full border py-2 pl-3.5 pr-8 text-xs transition-colors ${
                  surface === "all"
                    ? "border-line bg-surface text-muted hover:text-ink"
                    : "border-pine bg-pine text-canvas"
                }`}
              >
                {(Object.keys(surfaceLabels) as SurfaceFilter[]).map((option) => (
                  <option key={option} value={option}>
                    {surfaceLabels[option]}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                aria-hidden
                className={`pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 ${
                  surface === "all" ? "text-muted" : "text-canvas"
                }`}
              />
            </div>

            <div className="relative">
              <select
                aria-label="Filter by price"
                value={band}
                onChange={(event) => setBand(event.target.value as PriceBand)}
                className={`appearance-none rounded-full border py-2 pl-3.5 pr-8 text-xs transition-colors ${
                  band === "any"
                    ? "border-line bg-surface text-muted hover:text-ink"
                    : "border-pine bg-pine text-canvas"
                }`}
              >
                {(Object.keys(priceLabels) as PriceBand[]).map((option) => (
                  <option key={option} value={option}>
                    {priceLabels[option]}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                aria-hidden
                className={`pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 ${
                  band === "any" ? "text-muted" : "text-canvas"
                }`}
              />
            </div>

            <p className="ml-auto shrink-0 text-xs tabular-nums text-muted" aria-live="polite">
              {String(filtered.length).padStart(2, "0")}{" "}
              {filtered.length === 1 ? "piece" : "pieces"}
            </p>
          </div>
        </div>
      </div>

      {isFiltered && (
        <div className="mt-5 flex items-center gap-3 text-xs text-muted">
          <span>
            Showing {surface === "all" ? "every room" : surfaceLabels[surface].toLowerCase()} ·{" "}
            {priceLabels[band].toLowerCase()}
          </span>
          <button
            type="button"
            onClick={clear}
            className="underline underline-offset-4 transition-colors hover:text-ink"
          >
            Clear
          </button>
        </div>
      )}

      <motion.div layout className="mt-8 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((product) => (
            <motion.div
              key={product.slug}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: easeOutExpo }}
            >
              <ProductCard
                product={product}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                headingLevel="h2"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="mt-14 rounded-2xl border border-line bg-surface px-8 py-16 text-center">
          <h2 className="text-2xl">Nothing in this combination yet.</h2>
          <p className="mx-auto mt-3 max-w-[36ch] text-sm leading-relaxed text-muted">
            The shop is short on purpose. Clear the filters to see every piece in this line.
          </p>
          <button type="button" onClick={clear} className="btn-outline mt-6">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
