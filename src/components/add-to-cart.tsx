"use client";

import { useState } from "react";

import { CheckIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { commerce } from "@/lib/brand";
import { useCartStore } from "@/lib/cart-store";
import { finishSwatch } from "@/lib/finishes";
import { formatPKR } from "@/lib/money";
import type { Product } from "@/lib/products";

export function AddToCart({ product }: { product: Product }) {
  const [finish, setFinish] = useState(product.finishes[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCartStore((state) => state.add);

  function addToBag() {
    add({
      slug: product.slug,
      name: product.name,
      finish,
      unitPrice: product.price,
      quantity,
      image: product.image,
      glyph: product.glyph,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between gap-6">
        <p className="eyebrow text-muted">Finish</p>
        <p className="text-xs text-ink">{finish}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {product.finishes.map((option) => {
          const active = option === finish;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setFinish(option)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2.5 rounded-full border px-3.5 py-2.5 text-xs transition-colors ${
                active
                  ? "border-pine bg-pine-soft text-ink"
                  : "border-line bg-surface text-muted hover:border-ink/35 hover:text-ink"
              }`}
            >
              <span
                aria-hidden
                className="h-3.5 w-3.5 rounded-full border border-ink/15"
                style={{ backgroundColor: finishSwatch(option) }}
              />
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <div className="flex h-13 items-center justify-between rounded-full border border-line bg-surface px-2 sm:w-36">
          <button
            type="button"
            aria-label="Reduce quantity"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span className="text-sm tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((value) => Math.min(value + 1, commerce.maxQuantity))}
            disabled={quantity >= commerce.maxQuantity}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        <button type="button" onClick={addToBag} className="btn-primary min-h-13 flex-1">
          {added ? (
            <>
              <CheckIcon className="h-4 w-4" />
              Added to bag
            </>
          ) : (
            <>
              Add to bag — {formatPKR(product.price * quantity)}
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Made to order · {Math.round(commerce.advanceRate * 100)}% advance, balance on delivery.
      </p>
    </div>
  );
}
