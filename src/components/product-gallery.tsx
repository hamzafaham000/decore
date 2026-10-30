"use client";

import { useRef, useState } from "react";

import { ProductImage } from "@/components/product-image";
import type { PlaceholderView } from "@/components/product-image";
import type { Product } from "@/lib/catalog-types";
import { productImages } from "@/lib/catalog-types";

type GalleryView = {
  /** The photograph, when this angle has been shot. */
  src?: string;
  /** The drawn composition shown while the photograph is still to come. */
  view: PlaceholderView;
  label: string;
};

const labels: Record<PlaceholderView, string> = {
  front: "Front view",
  detail: "Detail",
  room: "In the room",
};

/**
 * The strip stays complete before the shoot. Real photographs are used first;
 * any gap is filled with a drawn view so a piece without photography still
 * reads as a gallery rather than a single lonely image. Adding `images` to a
 * product replaces the fillers from the front.
 */
export function galleryViews(product: Product): GalleryView[] {
  const photos = productImages(product);
  const views: GalleryView[] = photos.map((src, index) => ({
    src,
    view: "front",
    label: index === 0 ? labels.front : `View ${index + 1}`,
  }));

  const fillers: PlaceholderView[] =
    photos.length === 0 ? ["front", "detail", "room"] : ["detail", "room"];

  for (const view of fillers) {
    if (views.length >= 3) break;
    views.push({ view, label: labels[view] });
  }

  return views;
}

export function ProductGallery({
  product,
  sizes = "(min-width: 1024px) 52vw, 100vw",
}: {
  product: Product;
  sizes?: string;
}) {
  const views = galleryViews(product);
  const [active, setActive] = useState(0);
  const thumbs = useRef<Array<HTMLButtonElement | null>>([]);

  const multiple = views.length > 1;
  const shown = Math.min(active, views.length - 1);

  function step(delta: number) {
    const next = (shown + delta + views.length) % views.length;
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
      const last = views.length - 1;
      setActive(last);
      thumbs.current[last]?.focus();
    }
  }

  return (
    <div className="flex flex-col">
      {multiple && (
        <div
          role="tablist"
          aria-label={`${product.name} images`}
          onKeyDown={onKeyDown}
          className="order-2 mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:mt-4 [&::-webkit-scrollbar]:hidden"
        >
          {views.map((item, index) => (
            <button
              key={`${item.src ?? item.view}-${index}`}
              ref={(element) => {
                thumbs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`product-thumb-${index}`}
              aria-controls="product-image-panel"
              aria-selected={index === shown}
              aria-label={`View: ${item.label}`}
              tabIndex={index === shown ? 0 : -1}
              onClick={() => setActive(index)}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border transition-all duration-200 ${
                index === shown
                  ? "border-pine ring-1 ring-pine"
                  : "border-line opacity-75 hover:opacity-100"
              }`}
            >
              <ProductImage
                product={{ name: product.name, image: item.src, glyph: product.glyph }}
                sizes="64px"
                view={item.view}
                compact
              />
            </button>
          ))}
        </div>
      )}

      <div className="order-1">
        <div
          id="product-image-panel"
          role={multiple ? "tabpanel" : undefined}
          aria-labelledby={multiple ? `product-thumb-${shown}` : undefined}
          className="relative aspect-4/5 overflow-hidden rounded-2xl bg-surface"
        >
          {views.map((item, index) => (
            <div
              key={`${item.src ?? item.view}-${index}`}
              aria-hidden={index !== shown}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === shown ? "opacity-100" : "opacity-0"
              }`}
            >
              <ProductImage
                product={{ name: product.name, image: item.src, glyph: product.glyph }}
                sizes={sizes}
                priority={index === 0}
                framed
                view={item.view}
                alt={
                  index === 0
                    ? `${product.name} — ${product.tagline}`
                    : `${product.name}, ${item.label.toLowerCase()}`
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
