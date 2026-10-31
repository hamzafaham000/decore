import { connection } from "next/server";

import Link from "next/link";

import { Empty, formatCount, formatDate, PageHeader, Panel, Stat, StatusPill } from "@/components/admin/ui";
import { ArrowRightIcon } from "@decore/ui";
import { prisma } from "@decore/db";
import { formatPKR } from "@decore/core";

export const metadata = { title: "Overview" };

export const instant = false;

const WEEK_DAYS = 7;

export default async function OverviewPage() {
  await connection();

  const since = new Date();
  since.setDate(since.getDate() - WEEK_DAYS);

  const [awaiting, recent, ordersWeek, revenueWeek, viewsWeek, visitorsWeek, live, drafts] =
    await Promise.all([
      prisma.order.count({ where: { status: "AWAITING_CONFIRMATION" } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { _count: { select: { items: true } } },
      }),
      prisma.order.count({ where: { createdAt: { gte: since }, status: { not: "CANCELLED" } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      prisma.pageView.count({ where: { createdAt: { gte: since } } }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: since }, visitor: { not: null } },
        distinct: ["visitor"],
        select: { visitor: true },
      }),
      prisma.product.count({ where: { published: true } }),
      prisma.product.count({ where: { published: false } }),
    ]);

  const orderValue = revenueWeek._sum.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={`${formatDate(new Date())} · orders, catalogue and traffic at a glance.`}
        action={
          <Link href="/admin/products/new" className="a-btn a-btn-primary">
            Add product
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Awaiting confirmation"
          value={formatCount(awaiting)}
          note={awaiting === 1 ? "One order needs a reply" : "Orders waiting on a reply"}
          href="/admin/orders?status=AWAITING_CONFIRMATION"
        />
        <Stat
          label="Orders · 7 days"
          value={formatCount(ordersWeek)}
          note="Excludes cancelled orders"
          href="/admin/orders"
        />
        <Stat
          label="Order value · 7 days"
          value={formatPKR(orderValue)}
          note="Before delivery, excludes cancelled"
        />
        <Stat
          label="Visits · 7 days"
          value={formatCount(viewsWeek)}
          note={`${formatCount(visitorsWeek.length)} visitors`}
          href="/admin/analytics"
        />
      </div>

      <Panel
        title="Latest orders"
        action={
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5e6963] transition-colors hover:text-[#111815]"
          >
            All orders
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        }
      >
        {recent.length === 0 ? (
          <Empty>No orders yet. They appear here as soon as the shop takes one.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="a-table min-w-[42rem]">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Order</th>
                  <th>Placed</th>
                  <th className="num">Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium hover:text-[#1f513f]"
                      >
                        {order.customerName}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/admin/orders/${order.id}`} className="a-code text-[#5e6963]">
                        {order.reference}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-[#657069]">
                        {order._count.items} {order._count.items === 1 ? "piece" : "pieces"}
                      </p>
                    </td>
                    <td className="text-xs text-[#657069]">{formatDate(order.createdAt, true)}</td>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Catalogue">
          <div className="divide-y divide-[#e8ece9]">
            <Link
              href="/admin/products?status=live"
              className="flex items-center justify-between px-5 py-3.5 text-sm transition-colors hover:bg-[#f7f9f7]"
            >
              <span>Live products</span>
              <span className="tabular-nums text-[#5e6963]">{live}</span>
            </Link>
            <Link
              href="/admin/products?status=draft"
              className="flex items-center justify-between px-5 py-3.5 text-sm transition-colors hover:bg-[#f7f9f7]"
            >
              <span>Drafts</span>
              <span className="tabular-nums text-[#5e6963]">{drafts}</span>
            </Link>
            <Link
              href="/admin/products/new"
              className="flex items-center justify-between px-5 py-3.5 text-sm transition-colors hover:bg-[#f7f9f7]"
            >
              <span className="text-[#5e6963]">Add product</span>
              <ArrowRightIcon className="h-4 w-4 text-[#657069]" />
            </Link>
          </div>
        </Panel>

        <Panel title="Traffic">
          <div className="divide-y divide-[#e8ece9]">
            <Link
              href="/admin/analytics"
              className="flex items-center justify-between px-5 py-3.5 text-sm transition-colors hover:bg-[#f7f9f7]"
            >
              <span>Visits, last 7 days</span>
              <span className="tabular-nums text-[#5e6963]">{formatCount(viewsWeek)}</span>
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center justify-between px-5 py-3.5 text-sm transition-colors hover:bg-[#f7f9f7]"
            >
              <span>Visitors, last 7 days</span>
              <span className="tabular-nums text-[#5e6963]">{formatCount(visitorsWeek.length)}</span>
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center justify-between px-5 py-3.5 text-sm transition-colors hover:bg-[#f7f9f7]"
            >
              <span className="text-[#5e6963]">Open traffic</span>
              <ArrowRightIcon className="h-4 w-4 text-[#657069]" />
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
