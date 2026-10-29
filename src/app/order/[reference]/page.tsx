import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArrowRightIcon, ChatIcon, CheckIcon, ClockIcon, TruckIcon } from "@/components/icons";
import { MoneyRow } from "@/components/money-row";
import { getCheckoutMethod } from "@/lib/checkout-methods";
import { prisma } from "@/lib/db";
import { formatPKR } from "@/lib/money";
import { getProduct } from "@/lib/products";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Order received",
  robots: { index: false, follow: false },
};

const statusLabels: Record<string, string> = {
  AWAITING_CONFIRMATION: "Awaiting confirmation",
  CONFIRMED: "Confirmed",
  PAID: "Paid",
  DISPATCHED: "Dispatched",
  CANCELLED: "Cancelled",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

async function Receipt({ reference }: { reference: string }) {
  const order = await prisma.order.findUnique({
    where: { reference },
    include: { items: true },
  });

  if (!order) notFound();

  const method = getCheckoutMethod(order.method);

  // Order rows keep the slug, so the window is read back from the catalogue. A piece
  // that has since left the catalogue simply has no lead time to report.
  const leadTimes = order.items.flatMap(
    (item) => getProduct(item.productSlug)?.leadTimeWeeks ?? [],
  );
  const buildWeeks = leadTimes.length ? Math.max(...leadTimes) : null;

  const whatsappMessage = [
    `Order ${order.reference}`,
    ...order.items.map((item) => `${item.quantity} × ${item.name} — ${item.finish}`),
    `Total ${formatPKR(order.total)} · Advance ${formatPKR(order.advanceDue)}`,
    ...(buildWeeks ? [`Build window: up to ${buildWeeks} weeks from confirmation`] : []),
    `Deliver to ${order.addressLine1}, ${order.city}`,
  ].join("\n");

  return (
    <div>
      <section className="overflow-hidden rounded-2xl bg-pine text-canvas">
        <div className="p-7 md:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-canvas/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-canvas/75">
            <span className="h-1.5 w-1.5 rounded-full bg-canvas" />
            {statusLabels[order.status] ?? order.status}
          </span>

          <div className="mt-8 flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas text-pine">
              <CheckIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="display-2 max-w-[18ch]">Thank you. We have your order.</h1>
              <p className="mt-4 max-w-[52ch] leading-relaxed text-canvas/70">
                {method?.nextStep ??
                  "We will be in touch to confirm the piece, the finish, and a delivery date."}
              </p>
            </div>
          </div>

          <dl className="mt-9 grid gap-6 border-t border-canvas/15 pt-6 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-canvas/70">Reference</dt>
              <dd className="mt-1.5 tabular-nums text-canvas/90">{order.reference}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-canvas/70">Placed</dt>
              <dd className="mt-1.5 text-canvas/90">{formatDate(order.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-canvas/70">Build window</dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-canvas/90">
                <ClockIcon className="h-3.5 w-3.5 text-canvas/70" />
                {buildWeeks ? `Up to ${buildWeeks} weeks` : "Confirmed with you"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-canvas/15 bg-canvas/[0.06] px-7 py-5 md:px-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-canvas/70">
              Send us the selection so we can confirm it today.
            </p>
            <a
              href={whatsappLink(whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-canvas px-5 py-3 text-[0.8125rem] font-medium text-ink transition-colors hover:bg-canvas/90"
            >
              <ChatIcon className="h-4 w-4" />
              Send on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-line bg-surface p-6 md:p-7">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl">Your pieces</h2>
            <span className="text-xs text-muted">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>

          <ul className="mt-5 divide-y divide-line border-y border-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-6 py-4">
                <span className="min-w-0">
                  <span className="block truncate text-sm">{item.name}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {item.finish} · Qty {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 text-sm tabular-nums">
                  {formatPKR(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 text-sm">
            <MoneyRow label="Subtotal" value={formatPKR(order.subtotal)} />
            <MoneyRow
              label="Delivery"
              value={order.deliveryFee === 0 ? "Included" : formatPKR(order.deliveryFee)}
            />
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="text-sm">Total</dt>
              <dd className="text-xl font-medium tabular-nums">{formatPKR(order.total)}</dd>
            </div>
          </dl>

          <div className="mt-4 space-y-2 rounded-xl bg-canvas px-4 py-3.5 text-xs">
            <MoneyRow
              label="Advance due"
              value={formatPKR(order.advanceDue)}
              valueClass="text-pine font-medium"
            />
            <MoneyRow label="Balance on delivery" value={formatPKR(order.balanceDue)} />
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex items-center gap-2 text-muted">
              <TruckIcon className="h-4 w-4" />
              <h2 className="text-sm font-medium text-ink">Delivering to</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              {order.customerName}
              <br />
              {order.addressLine1}
              {order.addressLine2 && (
                <>
                  <br />
                  {order.addressLine2}
                </>
              )}
              <br />
              {order.city}
              <br />
              <span className="text-muted">{order.phone}</span>
            </p>
          </section>

          {order.notes && (
            <section className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-medium">Your note</h2>
              <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-muted">{order.notes}</p>
            </section>
          )}

          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-sm font-medium">What happens next</h2>
            <ol className="mt-4 space-y-4">
              {[
                { title: "We confirm", body: "By WhatsApp or email, usually the same day." },
                {
                  title: "The build begins",
                  body: `Once the advance is received${buildWeeks ? `, allow up to ${buildWeeks} weeks` : ""}.`,
                },
                { title: "Delivery", body: "You are contacted to arrange a hand-delivery window." },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line text-[10px] tabular-nums text-muted">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-medium">{step.title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                      {step.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <ArrowRightIcon className="h-4 w-4 rotate-180" />
          Back to the collection
        </Link>
        <p className="text-xs text-muted">Keep this reference: {order.reference}</p>
      </div>
    </div>
  );
}

export default function OrderPage({ params }: PageProps<"/order/[reference]">) {
  return (
    <div className="page-shell max-w-5xl pb-24 pt-6 md:pt-8">
      <Suspense
        fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-64 rounded-2xl bg-line/40" />
            <div className="h-40 rounded-2xl bg-line/40" />
          </div>
        }
      >
        <Resolved params={params} />
      </Suspense>
    </div>
  );
}

async function Resolved({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return <Receipt reference={reference} />;
}
