import { connection } from "next/server";

import Link from "next/link";

import { Empty, formatDate, PageHeader, Panel, StatusPill } from "@/components/admin/ui";
import type { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { formatPKR } from "@/lib/money";

export const metadata = { title: "Orders" };

export const instant = false;

const filters: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "AWAITING_CONFIRMATION", label: "To confirm" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PAID", label: "Paid" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await connection();

  const { status = "all", q = "" } = await searchParams;
  const query = q.trim();

  const where = {
    ...(status === "all" ? {} : { status: status as OrderStatus }),
    ...(query
      ? {
          OR: [
            { reference: { contains: query, mode: "insensitive" as const } },
            { customerName: { contains: query, mode: "insensitive" as const } },
            { phone: { contains: query } },
          ],
        }
      : {}),
  };

  const [orders, grouped, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.count(),
  ]);

  const counts: Record<string, number> = { all: total };
  for (const group of grouped) counts[group.status] = group._count._all;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Orders"
        description="Every order the shop has taken. Confirming one does not send anything automatically."
      />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => {
            const active = status === filter.value;
            const href = {
              pathname: "/admin/orders",
              query: {
                ...(filter.value === "all" ? {} : { status: filter.value }),
                ...(query ? { q: query } : {}),
              },
            };

            return (
              <Link
                key={filter.value}
                href={href}
                className={`rounded-full px-3.5 py-2 text-xs transition-colors ${
                  active
                    ? "bg-pine text-canvas"
                    : "border border-line text-muted hover:border-ink/30 hover:text-ink"
                }`}
              >
                {filter.label}
                <span className={`ml-2 tabular-nums ${active ? "text-canvas/60" : "text-muted/70"}`}>
                  {counts[filter.value] ?? 0}
                </span>
              </Link>
            );
          })}
        </div>

        <form method="get" className="flex gap-2">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Reference, name or phone"
            aria-label="Search orders"
            className="field max-w-xs"
          />
          <button type="submit" className="btn-outline">
            Search
          </button>
        </form>
      </div>

      <Panel>
        {orders.length === 0 ? (
          <Empty>{query ? `No orders match “${query}”.` : "No orders here yet."}</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Placed</th>
                  <th className="px-3 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-ink/[0.02]">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {order.reference}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">
                        {order._count.items} {order._count.items === 1 ? "piece" : "pieces"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p>{order.customerName}</p>
                      <p className="mt-0.5 text-xs text-muted">{order.phone}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">
                      {formatDate(order.createdAt, true)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatPKR(order.total)}</td>
                    <td className="px-5 py-3">
                      <StatusPill status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {orders.length === 200 && (
        <p className="text-xs text-muted">
          Showing the 200 most recent. Narrow the list with a status or a search.
        </p>
      )}
    </div>
  );
}
