import { connection } from "next/server";

import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDate, PageHeader, Panel, StatusPill } from "@/components/admin/ui";
import { ArrowRightIcon, ChatIcon } from "@decore/ui";
import { getCheckoutMethod } from "@decore/core";
import { prisma } from "@decore/db";
import { formatPKR } from "@decore/core";

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
      <dt className="text-[#5e6963]">{label}</dt>
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
  const address = [order.addressLine1, order.addressLine2, order.city].filter(Boolean);

  const whatsapp = `https://wa.me/${waNumber(order.phone)}?text=${encodeURIComponent(
    `Hello ${order.customerName.split(" ")[0]} — this is about your order ${order.reference}.`,
  )}`;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5e6963] transition-colors hover:text-[#111815]"
      >
        <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
        All orders
      </Link>

      <PageHeader
        title={order.reference}
        description={`Placed ${formatDate(order.createdAt, true)} · ${method?.label ?? order.method}`}
        action={<StatusPill status={order.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-4">
          <Panel title="Pieces">
            <div className="overflow-x-auto">
              <table className="a-table min-w-[28rem]">
                <thead>
                  <tr>
                    <th>Piece</th>
                    <th className="num">Qty</th>
                    <th className="num">Each</th>
                    <th className="num">Line</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link
                          href={`/product/${item.productSlug}`}
                          target="_blank"
                          className="font-medium hover:text-[#1f513f] hover:underline hover:underline-offset-2"
                        >
                          {item.name}
                        </Link>
                        <p className="a-code mt-0.5 text-[#657069]">/{item.productSlug}</p>
                      </td>
                      <td className="num">{item.quantity}</td>
                      <td className="num">{formatPKR(item.unitPrice)}</td>
                      <td className="num">{formatPKR(item.unitPrice * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="space-y-2 border-t border-[#e2e7e3] px-5 py-4">
              <Row label="Subtotal" value={formatPKR(order.subtotal)} />
              <Row
                label="Delivery"
                value={order.deliveryFee === 0 ? "Included" : formatPKR(order.deliveryFee)}
              />
              <div className="flex items-baseline justify-between gap-4 border-t border-[#e2e7e3] pt-2.5 text-sm font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPKR(order.total)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Customer">
            <div className="space-y-4 px-5 py-4">
              <div>
                <p className="text-sm font-medium">{order.customerName}</p>
                <p className="mt-0.5 text-sm text-[#5e6963]">{order.phone}</p>
                {order.email && <p className="mt-0.5 text-sm text-[#5e6963]">{order.email}</p>}
              </div>

              <p className="text-sm leading-relaxed text-[#5e6963]">{address.join(", ")}</p>

              {order.notes && (
                <div className="rounded-lg bg-[#f5f8f6] px-4 py-3">
                  <p className="text-[11px] font-medium text-[#657069]">Notes</p>
                  <p className="mt-1.5 text-sm leading-relaxed">{order.notes}</p>
                </div>
              )}

              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="a-btn a-btn-secondary"
              >
                <ChatIcon className="h-4 w-4" />
                Message on WhatsApp
              </a>
            </div>
          </Panel>
        </div>

        <div className="min-w-0 space-y-4">
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
              <button type="submit" className="a-btn a-btn-primary w-full">
                Update status
              </button>
            </form>
          </Panel>

          <Panel title="Payment">
            <dl className="space-y-2 px-5 py-4">
              <Row label="Advance due" value={formatPKR(order.advanceDue)} />
              <Row label="Balance" value={formatPKR(order.balanceDue)} />
            </dl>
            <form action={setAdvancePaid} className="border-t border-[#e2e7e3] px-5 py-4">
              <input type="hidden" name="id" value={order.id} />
              <p className="text-xs leading-relaxed text-[#5e6963]">
                {order.advancePaid
                  ? "The advance has been received."
                  : "The advance has not been marked as received."}
              </p>
              <button type="submit" className="a-btn a-btn-secondary mt-3 w-full">
                {order.advancePaid ? "Mark advance unpaid" : "Mark advance received"}
              </button>
            </form>
          </Panel>

          <Panel title="Delivery">
            <div className="space-y-2 px-5 py-4 text-sm">
              <p className="text-[#5e6963]">
                {order.cancellationOk
                  ? "Customer accepts a substitute if this piece cannot be made."
                  : "No substitution agreed for this order."}
              </p>
              <p className="text-xs text-[#657069]">
                Last change {formatDate(order.updatedAt, true)}
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
