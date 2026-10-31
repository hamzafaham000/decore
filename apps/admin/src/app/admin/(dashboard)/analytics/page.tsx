import { connection } from "next/server";

import Link from "next/link";

import { Empty, formatCount, PageHeader, Panel, Stat } from "@/components/admin/ui";
import { prisma } from "@decore/db";
import { formatPKR } from "@decore/core";
import { siteUrl } from "@decore/core";

export const metadata = { title: "Traffic" };

export const instant = false;

const ranges = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

function sourceOf(referrer: string | null, ownHost: string) {
  if (!referrer) return "Direct";

  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host === ownHost ? "Our own pages" : host;
  } catch {
    return "Other";
  }
}

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short" }).format(date);
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await connection();

  const requested = Number((await searchParams).range ?? 30);
  const days = ranges.some((range) => range.value === requested) ? requested : 30;

  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const [views, orders, products, categories] = await Promise.all([
    prisma.pageView.findMany({
      where: { createdAt: { gte: start } },
      select: { path: true, referrer: true, device: true, visitor: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: start }, status: { not: "CANCELLED" } },
      select: { total: true },
    }),
    prisma.product.findMany({ select: { slug: true, name: true } }),
    prisma.category.findMany({ select: { slug: true, label: true } }),
  ]);

  const productNames = new Map(products.map((product) => [product.slug, product.name]));
  const categoryNames = new Map(categories.map((category) => [category.slug, category.label]));

  function labelFor(path: string) {
    if (path === "/") return "Home";
    if (path === "/collection") return "Shop";
    if (path === "/checkout") return "Checkout";
    if (path === "/contact") return "Contact";
    if (path === "/made-to-order") return "Made to order";
    if (path.startsWith("/collection/")) {
      const slug = path.split("/")[2] ?? "";
      return categoryNames.get(slug) ?? slug;
    }
    if (path.startsWith("/product/")) {
      const slug = path.split("/")[2] ?? "";
      return productNames.get(slug) ?? slug;
    }
    if (path.startsWith("/order/")) return "Order receipt";
    return path;
  }

  // Daily buckets, visitors counted once per day by the random browser id.
  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return {
      key: date.toISOString().slice(0, 10),
      label: dayLabel(date),
      views: 0,
      visitors: new Set<string>(),
    };
  });
  const bucketByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  const paths = new Map<string, number>();
  const sources = new Map<string, number>();
  const devices = new Map<string, number>();
  const visitors = new Set<string>();
  const ownHost = new URL(siteUrl).hostname.replace(/^www\./, "");

  for (const view of views) {
    const bucket = bucketByKey.get(view.createdAt.toISOString().slice(0, 10));
    if (bucket) {
      bucket.views += 1;
      if (view.visitor) bucket.visitors.add(view.visitor);
    }

    paths.set(view.path, (paths.get(view.path) ?? 0) + 1);
    const source = sourceOf(view.referrer, ownHost);
    sources.set(source, (sources.get(source) ?? 0) + 1);
    const device = view.device ?? "Unknown";
    devices.set(device, (devices.get(device) ?? 0) + 1);
    if (view.visitor) visitors.add(view.visitor);
  }

  const totalViews = views.length;
  const orderValue = orders.reduce((sum, order) => sum + order.total, 0);
  const maxDay = Math.max(1, ...buckets.map((bucket) => bucket.views));

  const topPaths = [...paths.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topSources = [...sources.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topDevices = [...devices.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Traffic"
        description="First-party counts from this site only. No third-party scripts, no cookies."
        action={
          <div className="a-segment">
            {ranges.map((range) => (
              <Link
                key={range.value}
                href={`/admin/analytics?range=${range.value}`}
                aria-current={days === range.value ? "page" : undefined}
              >
                {range.label}
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Page views" value={formatCount(totalViews)} note={`Last ${days} days`} />
        <Stat
          label="Visitors"
          value={formatCount(visitors.size)}
          note="Distinct browsers, not people"
        />
        <Stat
          label="Orders"
          value={formatCount(orders.length)}
          note="Excludes cancelled"
          href="/admin/orders"
        />
        <Stat label="Order value" value={formatPKR(orderValue)} note="Excludes cancelled" />
      </div>

      <Panel title="Views by day">
        {totalViews === 0 ? (
          <Empty>
            Nothing recorded yet. Visits are counted from the moment this dashboard goes live.
          </Empty>
        ) : (
          <div className="px-5 py-5">
            <div className="a-chart" role="img" aria-label="Page views per day">
              {buckets.map((bucket) => (
                <div
                  key={bucket.key}
                  title={`${bucket.label}: ${bucket.views} views, ${bucket.visitors.size} visitors`}
                  className="a-chart-bar"
                  style={{
                    height: bucket.views ? `${Math.max((bucket.views / maxDay) * 100, 3)}%` : "2px",
                  }}
                />
              ))}
            </div>
            <div className="mt-3 flex justify-between text-[11px] text-[#657069]">
              <span>{buckets[0]?.label}</span>
              {buckets.length > 2 && <span>{buckets[Math.floor(buckets.length / 2)]?.label}</span>}
              <span>{buckets[buckets.length - 1]?.label}</span>
            </div>
          </div>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Most viewed">
          {topPaths.length === 0 ? (
            <Empty>No page views yet.</Empty>
          ) : (
            <ul className="divide-y divide-[#e8ece9]">
              {topPaths.map(([path, count]) => (
                <li key={path} className="px-5 py-3">
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <Link
                      href={path}
                      target="_blank"
                      className="truncate hover:text-[#1f513f] hover:underline hover:underline-offset-2"
                    >
                      {labelFor(path)}
                    </Link>
                    <span className="shrink-0 tabular-nums text-[#5e6963]">{formatCount(count)}</span>
                  </div>
                  <div className="a-meter mt-2">
                    <span style={{ width: `${(count / topPaths[0][1]) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Where visits came from">
            {topSources.length === 0 ? (
              <Empty>No visits yet.</Empty>
            ) : (
              <ul className="divide-y divide-[#e8ece9]">
                {topSources.map(([source, count]) => (
                  <li
                    key={source}
                    className="flex items-baseline justify-between gap-4 px-5 py-3 text-sm"
                  >
                    <span className="truncate">{source}</span>
                    <span className="shrink-0 tabular-nums text-[#5e6963]">{formatCount(count)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Devices">
            {topDevices.length === 0 ? (
              <Empty>No visits yet.</Empty>
            ) : (
              <ul className="divide-y divide-[#e8ece9]">
                {topDevices.map(([device, count]) => (
                  <li
                    key={device}
                    className="flex items-baseline justify-between gap-4 px-5 py-3 text-sm"
                  >
                    <span>{device}</span>
                    <span className="tabular-nums text-[#5e6963]">{formatCount(count)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
