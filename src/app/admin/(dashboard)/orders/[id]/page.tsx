import { connection } from "next/server";

import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDate, PageHeader, Panel, StatusPill } from "@/components/admin/ui";
import { ArrowRightIcon, ChatIcon } from "@/components/icons";
import { getCheckoutMethod } from "@/lib/checkout-methods";
import { prisma } from "@/lib/db";
import { formatPKR } from "@/lib/money";

import { setAdvancePaid, updateStatus } from "../actions";

export const metadata = { title: "Order" };

export const instant = false;

const statuses = [
  { value: "AWAITING_CONFIRMATION", label: "Awaiting confirmation" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PAID", label: "Paid" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "CANCELLED", label: "Cancelled" },
];

function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `92${digits.slice(1)}` : digits;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  const method = getCheckoutMethod(order.method);
  const address = [
    order.addressLine1,
    order.addressLine2,
    order.city,
  ].filter(Boolean);

  const whatsapp = `https://wa.me/${waNumber(order.phone)}?text=${encodeURIComponent(
    `Hello ${order.customerName.split(" ")[0]} — this is about your order ${order.reference}.`,
  )}`;

  return (
    <div className="space-y-8">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink"
      >
        <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
        All orders
      </Link>

      <PageHeader
        title={order.reference}
        description={`Placed ${formatDate(order.createdAt, true)} · ${method?.label ?? order.method}`}
        action={<StatusPill status={order.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Panel title="Pieces">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[26rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
                    <th className="px-5 py-3 font-medium">Piece</th>
                    <th className="px-3 py-3 text-right font-medium">Qty</th>
                    <th className="px-3 py-3 text-right font-medium">Each</th>
                    <th className="px-5 py-3 text-right font-medium">Line</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-3">
                        <Link
                          href={`/product/${item.productSlug}`}
                          target="_blank"
                          className="underline-offset-4 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted">/{item.productSlug}</p>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{item.quantity}</td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {formatPKR(item.unitPrice)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {formatPKR(item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="space-y-2 border-t border-line px-5 py-4">
              <Row label="Subtotal" value={formatPKR(order.subtotal)} />
              <Row
                label="Delivery"
                value={order.deliveryFee === 0 ? "Included" : formatPKR(order.deliveryFee)}
              />
              <div className="flex items-baseline justify-between gap-4 border-t border-line pt-2 text-sm font-medium">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPKR(order.total)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Customer">
            <div className="space-y-4 px-5 py-4">
              <div>
                <p className="text-sm font-medium">{order.customerName}</p>
                <p className="mt-0.5 text-sm text-muted">{order.phone}</p>
                {order.email && <p className="mt-0.5 text-sm text-muted">{order.email}</p>}
              </div>

              <p className="text-sm leading-relaxed text-muted">{address.join(", ")}</p>

              {order.notes && (
                <div className="rounded-xl bg-canvas px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">Notes</p>
                  <p className="mt-1.5 text-sm leading-relaxed">{order.notes}</p>
                </div>
              )}

              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-xs font-medium transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
              >
                <ChatIcon className="h-4 w-4" />
                Message on WhatsApp
              </a>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Status">
            <form action={updateStatus} className="space-y-3 px-5 py-4">
              <input type="hidden" name="id" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                aria-label="Order status"
                className="field"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-primary w-full">
                Update status
              </button>
            </form>
          </Panel>

          <Panel title="Payment">
            <dl className="space-y-2 px-5 py-4">
              <Row label="Advance due" value={formatPKR(order.advanceDue)} />
              <Row label="Balance" value={formatPKR(order.balanceDue)} />
            </dl>
            <form action={setAdvancePaid} className="border-t border-line px-5 py-4">
              <input type="hidden" name="id" value={order.id} />
              <p className="text-xs leading-relaxed text-muted">
                {order.advancePaid
                  ? "The advance has been received."
                  : "The advance has not been marked as received."}
              </p>
              <button type="submit" className="btn-outline mt-3 w-full">
                {order.advancePaid ? "Mark advance unpaid" : "Mark advance received"}
              </button>
            </form>
          </Panel>

          <Panel title="Delivery">
            <div className="space-y-2 px-5 py-4 text-sm">
              <p className="text-muted">
                {order.cancellationOk
                  ? "Customer accepts a substitute if this piece cannot be made."
                  : "No substitution agreed for this order."}
              </p>
              <p className="text-xs text-muted">
                Last change {formatDate(order.updatedAt, true)}
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
