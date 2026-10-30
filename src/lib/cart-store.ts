"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { commerce } from "@/lib/brand";
import type { Product } from "@/lib/catalog-types";

export type CartItem = {
  slug: string;
  name: string;
  finish: string;
  unitPrice: number;
  quantity: number;
  image?: string;
  glyph: Product["glyph"];
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (item: CartItem) => void;
  setQuantity: (slug: string, finish: string, quantity: number) => void;
  remove: (slug: string, finish: string) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

function lineKey(item: Pick<CartItem, "slug" | "finish">) {
  return `${item.slug}::${item.finish}`;
}

/** Same ceiling the order API applies, so the cart can never hold a rejected line. */
function cap(quantity: number) {
  return Math.min(quantity, commerce.maxQuantity);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      add: (item) =>
        set((state) => {
          const key = lineKey(item);
          const existing = state.items.some((candidate) => lineKey(candidate) === key);

          const items = existing
            ? state.items.map((candidate) =>
                lineKey(candidate) === key
                  ? { ...candidate, quantity: cap(candidate.quantity + item.quantity) }
                  : candidate,
              )
            : [...state.items, { ...item, quantity: cap(item.quantity) }];

          return { items, isOpen: true };
        }),

      setQuantity: (slug, finish, quantity) =>
        set((state) => {
          const key = lineKey({ slug, finish });

          if (quantity <= 0) {
            return { items: state.items.filter((item) => lineKey(item) !== key) };
          }

          return {
            items: state.items.map((item) =>
              lineKey(item) === key ? { ...item, quantity: cap(quantity) } : item,
            ),
          };
        }),

      remove: (slug, finish) =>
        set((state) => {
          const key = lineKey({ slug, finish });
          return { items: state.items.filter((item) => lineKey(item) !== key) };
        }),

      clear: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "decore-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}
