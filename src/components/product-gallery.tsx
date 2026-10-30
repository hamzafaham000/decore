"use client";

import { useRef, useState } from "react";

import { ProductImage } from "@/components/product-image";
import type { Product } from "@/lib/products";
import { productImages } from "@/lib/products";

/**
 * The product photograph, plus a thumbnail strip when a piece has been shot
 * from more than one angle. A single-photograph piece renders exactly as it
 * did before: no strip, no extra chrome.
 */
export function ProductGallery({
  product,
  sizes = "(min-width: 1024px) 52vw, 100vw",
}: {
  product: Product;
  sizes?: string;
}) {
  const images = productImages(product);
  const [active, setActive] = useState(0);
  const thumbs = useRef<Array<HTMLButtonElement | null>>([]);

  const multiple = images.length > 1;
  const shown = Math.min(active, Math.max(images.length - 1, 0));

  function step(delta: number) {
    const next = (shown + delta + images.length) % images.length;
    setActive(next);
    thumbs.current[next]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!multiple) return;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
      thumbs.current[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      const last = images.length - 1;
      setActive(last);
      thumbs.current[last]?.focus();
    }
  }

  return (
    <div className={multiple ? "flex flex-col lg:flex-row lg:items-start lg:gap-3" : undefined}>
      {multiple && (
        <div
          role="tablist"
          aria-label={`${product.name} images`}
          onKeyDown={onKeyDown}
          className="order-2 mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:order-1 lg:mt-0 lg:w-16 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              ref={(element) => {
                thumbs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`product-thumb-${index}`}
              aria-controls="product-image-panel"
              aria-selected={index === shown}
              aria-label={`View image ${index + 1} of ${images.length}`}
              tabIndex={index === shown ? 0 : -1}
              onClick={() => setActive(index)}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border transition-all duration-200 ${
                index === shown
                  ? "border-pine ring-1 ring-pine"
                  : "border-line opacity-75 hover:opacity-100"
              }`}
            >
              <ProductImage
                product={{ name: product.name, image: src, glyph: product.glyph }}
                sizes="64px"
                compact
              />
            </button>
          ))}
        </div>
      )}

      <div
        className={`order-1 ${multiple ? "lg:order-2 lg:min-w-0 lg:flex-1" : ""}`}
      >
        <div
          id="product-image-panel"
          role={multiple ? "tabpanel" : undefined}
          aria-labelledby={multiple ? `product-thumb-${shown}` : undefined}
          className="relative aspect-4/5 overflow-hidden rounded-2xl bg-surface"
        >
          {images.length === 0 ? (
            <ProductImage
              product={product}
              sizes={sizes}
              priority
              framed
              alt={`${product.name} — ${product.tagline}`}
            />
          ) : (
            images.map((src, index) => (
              <div
                key={`${src}-${index}`}
                aria-hidden={index !== shown}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === shown ? "opacity-100" : "opacity-0"
                }`}
              >
                <ProductImage
                  product={{ name: product.name, image: src, glyph: product.glyph }}
                  sizes={sizes}
                  priority={index === 0}
                  framed
                  alt={
                    index === 0
                      ? `${product.name} — ${product.tagline}`
                      : `${product.name}, view ${index + 1} of ${images.length}`
                  }
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
