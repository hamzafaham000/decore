import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <h1 className="display-3">{title}</h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-line bg-surface ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          {title && <h2 className="text-sm font-medium">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  note,
  href,
}: {
  label: string;
  value: string;
  note?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="eyebrow text-muted">{label}</p>
      <p className="mt-4 font-display text-[2.1rem] leading-none tracking-[-0.02em] tabular-nums">
        {value}
      </p>
      {note && <p className="mt-3 text-xs leading-relaxed text-muted">{note}</p>}
    </>
  );

  const className =
    "block rounded-2xl border border-line bg-surface p-5 transition-colors" +
    (href ? " hover:border-ink/30" : "");

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

const statusStyles: Record<string, string> = {
  AWAITING_CONFIRMATION: "bg-clay/10 text-clay",
  CONFIRMED: "bg-pine-soft text-pine",
  PAID: "bg-pine text-canvas",
  DISPATCHED: "bg-ink/10 text-ink",
  CANCELLED: "bg-line text-muted line-through",
};

const statusLabels: Record<string, string> = {
  AWAITING_CONFIRMATION: "Awaiting confirmation",
  CONFIRMED: "Confirmed",
  PAID: "Paid",
  DISPATCHED: "Dispatched",
  CANCELLED: "Cancelled",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${
        statusStyles[status] ?? "bg-line text-muted"
      }`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-5 py-12 text-center text-sm text-muted">{children}</p>;
}

export function formatDate(date: Date, withTime = false) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}

/** Compact counts for the dashboard: 12.4k, 1.2m. */
export function formatCount(value: number) {
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${(value / 1000).toFixed(value < 10_000 ? 1 : 0)}k`;
  return `${(value / 1_000_000).toFixed(1)}m`;
}
