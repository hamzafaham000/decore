"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import { easeOutExpo } from "@/lib/motion";
import type { Product, Surface } from "@/lib/products";

type SurfaceFilter = "all" | Surface;

const surfaceLabels: Record<SurfaceFilter, string> = {
  all: "Every room",
  home: "Home",
  office: "Office",
};

export function CollectionBrowser({ products }: { products: Product[] }) {
  const lines = useMemo(
    () => ["All pieces", ...Array.from(new Set(products.map((product) => product.line)))],
    [products],
  );
  const [line, setLine] = useState("All pieces");
  const [surface, setSurface] = useState<SurfaceFilter>("all");

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (line === "All pieces" || product.line === line) &&
          (surface === "all" || product.surfaces.includes(surface)),
      ),
    [products, line, surface],
  );

  const isFiltered = line !== "All pieces" || surface !== "all";

  return (
    <div>
      <div className="sticky top-[4.5rem] z-30 -mx-[clamp(1.25rem,4vw,4rem)] border-y border-line bg-canvas/90 px-[clamp(1.25rem,4vw,4rem)] backdrop-blur-md md:top-20">
        <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {lines.map((option) => {
              const active = option === line;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLine(option)}
                  aria-pressed={active}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[0.8125rem] transition-colors ${
                    active
                      ? "border-pine bg-pine text-canvas"
                      : "border-line bg-surface text-muted hover:border-ink/40 hover:text-ink"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
              {(Object.keys(surfaceLabels) as SurfaceFilter[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSurface(option)}
                  aria-pressed={surface === option}
                  className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                    surface === option
                      ? "bg-ink text-canvas"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {surfaceLabels[option]}
                </button>
              ))}
            </div>

            <p className="shrink-0 text-xs tabular-nums text-muted" aria-live="polite">
              {String(filtered.length).padStart(2, "0")}{" "}
              {filtered.length === 1 ? "piece" : "pieces"}
            </p>
          </div>
        </div>
      </div>

      {isFiltered && (
        <div className="mt-5 flex items-center gap-3 text-xs text-muted">
          <span>
            Showing {line === "All pieces" ? "all lines" : line} ·{" "}
            {surfaceLabels[surface].toLowerCase()}
          </span>
          <button
            type="button"
            onClick={() => {
              setLine("All pieces");
              setSurface("all");
            }}
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
                index={products.findIndex((candidate) => candidate.slug === product.slug)}
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
            The collection is short on purpose. Clear the filters to see every piece.
          </p>
          <button
            type="button"
            onClick={() => {
              setLine("All pieces");
              setSurface("all");
            }}
            className="btn-outline mt-6"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
