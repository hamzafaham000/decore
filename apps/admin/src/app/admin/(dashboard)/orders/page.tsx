import { connection } from "next/server";

import Link from "next/link";

import { Empty, formatDate, PageHeader, Panel, StatusPill } from "@/components/admin/ui";
import type { OrderStatus } from "@decore/db";
import { prisma } from "@decore/db";
import { formatPKR } from "@decore/core";

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
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Every order the shop has taken. Confirming one does not send anything automatically."
      />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="a-segment overflow-x-auto">
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
                aria-current={active ? "page" : undefined}
              >
                {filter.label}
                <span className={`tabular-nums ${active ? "opacity-55" : "opacity-70"}`}>
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
          <button type="submit" className="a-btn a-btn-secondary">
            Search
          </button>
        </form>
      </div>

      <Panel>
        {orders.length === 0 ? (
          <Empty>{query ? `No orders match “${query}”.` : "No orders here yet."}</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="a-table min-w-[44rem]">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Placed</th>
                  <th className="num">Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="a-code font-medium text-[#1f513f] hover:underline hover:underline-offset-2"
                      >
                        {order.reference}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-[#657069]">
                        {order._count.items} {order._count.items === 1 ? "piece" : "pieces"}
                      </p>
                    </td>
                    <td>
                      <p>{order.customerName}</p>
                      <p className="mt-0.5 text-xs text-[#657069]">{order.phone}</p>
                    </td>
                    <td className="text-xs text-[#657069]">
                      {formatDate(order.createdAt, true)}
                    </td>
                    <td className="num">{formatPKR(order.total)}</td>
                    <td>
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
        <p className="text-xs text-[#657069]">
          Showing the 200 most recent. Narrow the list with a status or a search.
        </p>
      )}
    </div>
  );
}
