"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

import { BagIcon, CloseIcon, MinusIcon, PlusIcon, TruckIcon } from "@/components/icons";
import { MoneyRow } from "@/components/money-row";
import { ProductImage } from "@/components/product-image";
import { commerce } from "@/lib/brand";
import { cartCount, useCartStore } from "@/lib/cart-store";
import { finishSwatch } from "@/lib/finishes";
import { formatPKR } from "@/lib/money";
import { easeOutExpo } from "@/lib/motion";
import { quoteFor } from "@/lib/pricing";

export function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  const quote = quoteFor(items);
  const count = cartCount(items);
  const freeDeliveryGap = commerce.freeDeliveryFrom - quote.subtotal;
  const freeDeliveryProgress = Math.min(
    100,
    Math.round((quote.subtotal / commerce.freeDeliveryFrom) * 100),
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your bag">
          <motion.button
            type="button"
            aria-label="Close bag"
            onClick={closeCart}
            className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-[28rem] flex-col bg-canvas shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: easeOutExpo }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
              <div className="flex items-center gap-3">
                <BagIcon className="h-5 w-5 text-muted" />
                <p className="text-sm font-medium">
                  Your bag
                  {count > 0 && (
                    <span className="ml-2 rounded-full bg-pine px-2 py-0.5 text-[10px] tabular-nums text-canvas">
                      {count}
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close bag"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted">
                  <BagIcon className="h-6 w-6" />
                </span>
                <p className="mt-5 text-2xl">Your bag is empty.</p>
                <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-muted">
                  Every piece is made to order, and the list stays short.
                </p>
                <Link href="/collection" onClick={closeCart} className="btn-primary mt-7">
                  Browse the shop
                </Link>
              </div>
            ) : (
              <>
                <div className="border-b border-line px-6 py-4">
                  {quote.deliveryFee === 0 ? (
                    <p className="flex items-center gap-2 text-xs text-pine">
                      <TruckIcon className="h-4 w-4" />
                      Complimentary delivery included.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-muted">
                        <span className="text-ink">{formatPKR(freeDeliveryGap)}</span> more for
                        complimentary delivery
                      </p>
                      <div
                        aria-hidden
                        className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-line"
                      >
                        <div
                          className="h-full rounded-full bg-pine transition-[width] duration-500"
                          style={{ width: `${freeDeliveryProgress}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>

                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                  {items.map((item) => (
                    <li key={`${item.slug}-${item.finish}`} className="flex gap-4 py-5">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-line/40"
                      >
                        <ProductImage
                          product={{ name: item.name, image: item.image, glyph: item.glyph }}
                          sizes="80px"
                          compact
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={closeCart}
                            className="truncate text-sm font-medium leading-snug hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="shrink-0 text-sm tabular-nums">
                            {formatPKR(item.unitPrice * item.quantity)}
                          </p>
                        </div>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                          <span
                            aria-hidden
                            className="h-2.5 w-2.5 rounded-full border border-ink/15"
                            style={{ backgroundColor: finishSwatch(item.finish) }}
                          />
                          {item.finish}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center rounded-full border border-line bg-surface">
                            <button
                              type="button"
                              aria-label={`Reduce ${item.name}`}
                              onClick={() =>
                                setQuantity(item.slug, item.finish, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:text-ink disabled:opacity-30"
                            >
                              <MinusIcon className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Add another ${item.name}`}
                              onClick={() =>
                                setQuantity(item.slug, item.finish, item.quantity + 1)
                              }
                              disabled={item.quantity >= commerce.maxQuantity}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:text-ink disabled:opacity-30"
                            >
                              <PlusIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => remove(item.slug, item.finish)}
                            className="text-[11px] uppercase tracking-[0.1em] text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-line px-6 py-5">
                  <dl className="space-y-2.5 text-sm">
                    <MoneyRow label="Subtotal" value={formatPKR(quote.subtotal)} />
                    <MoneyRow
                      label="Delivery"
                      value={quote.deliveryFee === 0 ? "Included" : formatPKR(quote.deliveryFee)}
                    />
                    <div className="flex items-baseline justify-between border-t border-line pt-3">
                      <dt className="text-sm">Total</dt>
                      <dd className="text-lg font-medium tabular-nums">{formatPKR(quote.total)}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 space-y-2 rounded-xl bg-surface px-4 py-3.5 text-xs">
                    <MoneyRow
                      label="Advance to confirm"
                      value={formatPKR(quote.advanceDue)}
                      valueClass="text-pine font-medium"
                    />
                    <MoneyRow
                      label="Balance on delivery"
                      value={formatPKR(quote.balanceDue)}
                    />
                  </div>

                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="btn-primary mt-4 w-full py-4"
                  >
                    Continue to checkout
                  </Link>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="mt-2 w-full rounded-full py-2.5 text-xs text-muted transition-colors hover:text-ink"
                  >
                    Keep browsing
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
