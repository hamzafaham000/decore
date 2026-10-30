import { connection } from "next/server";

import Link from "next/link";

import { Empty, formatCount, formatDate, PageHeader, Panel, Stat, StatusPill } from "@/components/admin/ui";
import { ArrowRightIcon } from "@/components/icons";
import { prisma } from "@/lib/db";
import { formatPKR } from "@/lib/money";

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
    <div className="space-y-10">
      <PageHeader
        title="The shop, today."
        description={formatDate(new Date())}
        action={
          <Link href="/admin/products/new" className="btn-primary">
            Add a piece
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="To confirm"
          value={formatCount(awaiting)}
          note={awaiting === 1 ? "One order is waiting" : "Orders waiting on a reply"}
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
            className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink"
          >
            All orders
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        }
      >
        {recent.length === 0 ? (
          <Empty>No orders yet. They will appear here as soon as the shop takes one.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 py-4 transition-colors hover:bg-ink/[0.03]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {order.reference} · {formatDate(order.createdAt, true)} ·{" "}
                      {order._count.items} {order._count.items === 1 ? "piece" : "pieces"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm tabular-nums">{formatPKR(order.total)}</p>
                    <StatusPill status={order.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Catalogue">
          <div className="divide-y divide-line">
            <Link
              href="/admin/products?status=live"
              className="flex items-center justify-between px-5 py-4 text-sm transition-colors hover:bg-ink/[0.03]"
            >
              <span>Live pieces</span>
              <span className="tabular-nums text-muted">{live}</span>
            </Link>
            <Link
              href="/admin/products?status=draft"
              className="flex items-center justify-between px-5 py-4 text-sm transition-colors hover:bg-ink/[0.03]"
            >
              <span>Drafts</span>
              <span className="tabular-nums text-muted">{drafts}</span>
            </Link>
            <Link
              href="/admin/products/new"
              className="flex items-center justify-between px-5 py-4 text-sm transition-colors hover:bg-ink/[0.03]"
            >
              <span className="text-muted">Add a piece</span>
              <ArrowRightIcon className="h-4 w-4 text-muted" />
            </Link>
          </div>
        </Panel>

        <Panel title="Traffic">
          <div className="divide-y divide-line">
            <Link
              href="/admin/analytics"
              className="flex items-center justify-between px-5 py-4 text-sm transition-colors hover:bg-ink/[0.03]"
            >
              <span>Visits, last 7 days</span>
              <span className="tabular-nums text-muted">{formatCount(viewsWeek)}</span>
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center justify-between px-5 py-4 text-sm transition-colors hover:bg-ink/[0.03]"
            >
              <span>Visitors, last 7 days</span>
              <span className="tabular-nums text-muted">{formatCount(visitorsWeek.length)}</span>
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center justify-between px-5 py-4 text-sm transition-colors hover:bg-ink/[0.03]"
            >
              <span className="text-muted">Open traffic</span>
              <ArrowRightIcon className="h-4 w-4 text-muted" />
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
