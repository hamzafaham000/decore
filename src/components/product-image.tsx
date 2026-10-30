import Image from "next/image";

import type { Product } from "@/lib/catalog-types";

const glyphs = {
  seating: (
    <>
      <path d="M34 52c0-14 6-22 20-22h12c14 0 20 8 20 22v18H34z" />
      <path d="M28 70h64v14H28z" />
      <path d="M38 84v14M82 84v14" />
    </>
  ),
  workspace: (
    <>
      <path d="M20 50h80v9H20z" />
      <path d="M30 59v38M90 59v38" />
      <path d="M38 68h26v12H38z" />
    </>
  ),
  table: (
    <>
      <path d="M18 48h84v10H18z" />
      <path d="M28 58v34M92 58v34" />
      <path d="M36 70h48v8H36z" />
    </>
  ),
  lighting: (
    <>
      <path d="M60 12v24" />
      <path d="M30 64c0-17 13-28 30-28s30 11 30 28z" />
      <path d="M30 64h60" />
      <circle cx="60" cy="76" r="6" />
    </>
  ),
  object: (
    <>
      <path d="M46 82c-5-20 0-36 9-47" />
      <path d="M74 82c5-20 0-36-9-47" />
      <circle cx="55" cy="32" r="4" />
      <circle cx="65" cy="32" r="4" />
      <circle cx="60" cy="63" r="10" />
      <path d="M40 86h40" />
    </>
  ),
} as const;

export type PlaceholderView = "front" | "detail" | "room";

/**
 * Stands in for product photography. Set `image` on a product in
 * src/lib/products.ts and the real photograph replaces this automatically.
 *
 * The three views are drawn differently on purpose: the gallery keeps a
 * thumbnail strip before the shoot, and identical tiles would look like a
 * broken switcher rather than three angles still to come.
 */
function Placeholder({
  glyph,
  compact,
  view,
}: {
  glyph: Product["glyph"];
  compact: boolean;
  view: PlaceholderView;
}) {
  const size = compact
    ? view === "detail"
      ? "h-[72%] w-[72%]"
      : view === "room"
        ? "h-[42%] w-[42%]"
        : "h-[52%] w-[52%]"
    : view === "detail"
      ? "h-[70%] w-[70%]"
      : view === "room"
        ? "h-[30%] w-[30%]"
        : "h-[40%] w-[40%]";

  const position =
    view === "detail" && !compact
      ? "absolute -right-[6%] -top-[2%]"
      : view === "room"
        ? "absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2"
        : "absolute inset-0 m-auto";

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#ebe6dc]">
      <div aria-hidden className="absolute inset-[7%] border border-ink/[0.05]" />
      {view === "room" && (
        <div
          aria-hidden
          className={`absolute inset-x-[10%] h-px bg-ink/[0.09] ${compact ? "top-[72%]" : "top-[66%]"}`}
        />
      )}
      <svg
        viewBox="0 0 120 120"
        aria-hidden
        className={`${position} ${size} ${compact ? "text-ink/25" : "text-ink/[0.13]"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {glyphs[glyph]}
      </svg>
      {!compact && (
        <p className="absolute bottom-[9%] left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.22em] text-ink/40">
          Photography to come
        </p>
      )}
    </div>
  );
}

export function ProductImage({
  product,
  sizes,
  priority = false,
  loading,
  alt,
  className = "",
  framed = false,
  compact = false,
  view = "front",
}: {
  product: Pick<Product, "name" | "image" | "glyph">;
  sizes: string;
  /** Above the fold: loads eagerly at high fetch priority. */
  priority?: boolean;
  /** Eager-load an image that is hidden until it is selected. */
  loading?: "lazy" | "eager";
  /** A fuller description than the product name, where the page has one. */
  alt?: string;
  className?: string;
  /**
   * Some of the launch photography is only 300 px wide. Framing it at a smaller
   * size keeps it from being stretched across a full column.
   */
  framed?: boolean;
  /** Hides the placeholder caption for thumbnails. */
  compact?: boolean;
  /** Which drawn view to use when the piece has no photograph. */
  view?: PlaceholderView;
}) {
  if (framed && product.image) {
    return (
      <div className={`flex h-full w-full items-center justify-center p-7 md:p-10 ${className}`}>
        <div className="relative h-full w-full max-w-[30rem]">
          <Image
            src={product.image}
            alt={alt ?? product.name}
            fill
            sizes={sizes}
            loading={priority ? "eager" : loading}
            fetchPriority={priority ? "high" : undefined}
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {product.image ? (
        <Image
          src={product.image}
          alt={alt ?? product.name}
          fill
          sizes={sizes}
          loading={priority ? "eager" : loading}
          fetchPriority={priority ? "high" : undefined}
          className="object-cover"
        />
      ) : (
        <Placeholder glyph={product.glyph} compact={compact} view={view} />
      )}
    </div>
  );
}
