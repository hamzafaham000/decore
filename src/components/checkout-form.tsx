"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  CardIcon,
  ChatIcon,
  CheckIcon,
  CloseIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
} from "@/components/icons";
import { MoneyRow } from "@/components/money-row";
import { ProductImage } from "@/components/product-image";
import { checkoutMethods, type CheckoutMethodId } from "@/lib/checkout-methods";
import { cartCount, useCartStore } from "@/lib/cart-store";
import { finishSwatch } from "@/lib/finishes";
import { formatPKR } from "@/lib/money";
import { quoteFor } from "@/lib/pricing";
import { useMounted } from "@/lib/use-mounted";

const methodIcons = {
  CARD: CardIcon,
  COD: TruckIcon,
  WHATSAPP: ChatIcon,
} as const;

function Label({ children, htmlFor }: { children: string; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-xs font-medium text-ink">
      {children}
    </label>
  );
}

function Step({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-7">
      <div className="flex items-start gap-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-[11px] tabular-nums text-muted">
          {number}
        </span>
        <div>
          <h2 className="text-xl leading-none">{title}</h2>
          {description && <p className="mt-2 text-xs text-muted">{description}</p>}
        </div>
      </div>
      <div className="mt-6 pl-0 sm:pl-11">{children}</div>
    </section>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const mounted = useMounted();

  const [method, setMethod] = useState<CheckoutMethodId>("CARD");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quote = quoteFor(items);
  const count = cartCount(items);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          customer: {
            name: form.get("name"),
            phone: form.get("phone"),
            email: form.get("email") || null,
            addressLine1: form.get("address1"),
            addressLine2: form.get("address2") || null,
            city: form.get("city"),
            notes: form.get("notes") || null,
            cancellationOk: form.get("cancellationOk") === "on",
          },
          items: items.map((item) => ({
            slug: item.slug,
            finish: item.finish,
            quantity: item.quantity,
          })),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "We could not place the order. Please try again.");
        setPending(false);
        return;
      }

      clear();
      if (payload.paymentRedirectUrl) {
        window.location.href = payload.paymentRedirectUrl;
        return;
      }

      router.push(`/order/${payload.reference}`);
    } catch {
      setError("We could not place the order. Please try again.");
      setPending(false);
    }
  }

  if (mounted && items.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center md:py-24">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted">
          <CardIcon className="h-6 w-6" />
        </span>
        <h1 className="display-3 mt-6">Nothing to check out yet.</h1>
        <p className="mx-auto mt-3 max-w-[38ch] leading-relaxed text-muted">
          Your bag is empty. Choose a piece and it will appear here when you are ready.
        </p>
        <Link href="/collection" className="btn-primary mt-7">
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs text-muted"
      >
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link href="/collection" className="transition-colors hover:text-ink">
          Collection
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink">Checkout</span>
      </nav>

      <div className="mt-5 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <h1 className="display-2">Checkout</h1>
          <p className="mt-4 max-w-[46ch] leading-relaxed text-muted">
            Tell us where the piece is going. Nothing is charged yet — we confirm every order by
            hand before a workshop starts.
          </p>

          <div className="mt-10 space-y-10">
            <Step number="01" title="Contact" description="How we reach you.">
              <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <input
                    id="name"
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    className="field"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <input
                    id="phone"
                    name="phone"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="03xx xxxxxxx"
                    className="field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="field"
                  />
                </div>
              </div>
            </Step>

            <Step number="02" title="Delivery" description="Where should the piece arrive?">
              <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="address1">Address</Label>
                  <input
                    id="address1"
                    name="address1"
                    required
                    autoComplete="address-line1"
                    placeholder="Street and building"
                    className="field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address2">Apartment, floor (optional)</Label>
                  <input
                    id="address2"
                    name="address2"
                    autoComplete="address-line2"
                    placeholder="Apartment, suite, floor"
                    className="field"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <input
                    id="city"
                    name="city"
                    required
                    autoComplete="address-level2"
                    placeholder="City"
                    className="field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="notes">Anything we should know (optional)</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    placeholder="Access notes, a preferred delivery window, or a question."
                    className="field resize-none"
                  />
                </div>
              </div>
            </Step>

            <Step
              number="03"
              title="Payment"
              description="Choose how you would like to confirm the order."
            >
              <div className="space-y-3">
                {checkoutMethods.map((option) => {
                  const Icon = methodIcons[option.id];
                  const active = method === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition-colors ${
                        active
                          ? "border-pine bg-pine-soft/60"
                          : "border-line bg-surface hover:border-ink/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        className="sr-only"
                        checked={active}
                        onChange={() => setMethod(option.id)}
                      />
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          active ? "bg-pine text-canvas" : "bg-canvas text-muted"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">{option.label}</span>
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              active
                                ? "border-pine bg-pine text-canvas"
                                : "border-line text-transparent"
                            }`}
                          >
                            <CheckIcon className="h-3 w-3" />
                          </span>
                        </span>
                        <span className="mt-1.5 block text-xs leading-relaxed text-muted">
                          {option.blurb}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-surface p-4 text-xs leading-relaxed text-muted">
                <input
                  type="checkbox"
                  name="cancellationOk"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--color-pine)]"
                />
                I understand these are made-to-order pieces, and that an order can be cancelled
                without charge only before the workshop cuts the timber.
              </label>
            </Step>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm font-medium">Your order</p>
              <Link href="/collection" className="text-xs text-muted underline underline-offset-4 hover:text-ink">
                Edit
              </Link>
            </div>

            <ul className="mt-5 space-y-4">
              {!mounted && <li className="text-sm text-muted">Loading your bag…</li>}
              {items.map((item) => (
                <li key={`${item.slug}-${item.finish}`} className="flex gap-3.5">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-line/40">
                    <ProductImage
                      product={{ name: item.name, image: item.image, glyph: item.glyph }}
                      sizes="64px"
                      compact
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium leading-snug">{item.name}</p>
                      <button
                        type="button"
                        onClick={() => remove(item.slug, item.finish)}
                        aria-label={`Remove ${item.name}`}
                        className="mt-0.5 text-muted transition-colors hover:text-ink"
                      >
                        <CloseIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full border border-ink/15"
                        style={{ backgroundColor: finishSwatch(item.finish) }}
                      />
                      {item.finish}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-line bg-canvas">
                        <button
                          type="button"
                          aria-label={`Reduce ${item.name}`}
                          onClick={() => setQuantity(item.slug, item.finish, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-6 w-6 items-center justify-center text-muted transition-colors hover:text-ink disabled:opacity-30"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-[11px] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Add another ${item.name}`}
                          onClick={() => setQuantity(item.slug, item.finish, item.quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center text-muted transition-colors hover:text-ink"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs tabular-nums">
                        {formatPKR(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
              <MoneyRow label="Subtotal" value={formatPKR(quote.subtotal)} />
              <MoneyRow
                label="Delivery"
                value={quote.deliveryFee === 0 ? "Included" : formatPKR(quote.deliveryFee)}
              />
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="text-sm">Total</dt>
                <dd className="text-xl font-medium tabular-nums">{formatPKR(quote.total)}</dd>
              </div>
            </dl>

            <div className="mt-4 space-y-2 rounded-xl bg-canvas px-4 py-3.5 text-xs">
              <MoneyRow
                label="Advance to confirm"
                value={formatPKR(quote.advanceDue)}
                valueClass="text-pine font-medium"
              />
              <MoneyRow label="Balance on delivery" value={formatPKR(quote.balanceDue)} />
            </div>

            {error && (
              <p className="mt-4 rounded-lg border border-clay/30 bg-clay/5 px-4 py-3 text-xs leading-relaxed text-clay">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending || !mounted || count === 0}
              className="btn-primary mt-5 w-full py-4"
            >
              {pending ? "Placing your order…" : "Place order"}
            </button>

            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
              Nothing is charged now. We confirm the order and send payment details.
            </p>
          </div>

          <p className="mt-4 px-2 text-center text-[11px] leading-relaxed text-muted">
            Need help?{" "}
            <Link href="/contact" className="text-ink underline underline-offset-4">
              Speak with us
            </Link>
            .
          </p>
        </aside>
      </div>
    </form>
  );
}
