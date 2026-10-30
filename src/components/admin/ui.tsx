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
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="a-title">{title}</h1>
        {description && <p className="a-sub max-w-2xl">{description}</p>}
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
    <section className={`a-card ${className}`}>
      {(title || action) && (
        <header className="a-card-head">
          {title && <h2 className="a-card-title">{title}</h2>}
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
      <p className="a-label">{label}</p>
      <p className="mt-3 text-[1.75rem] font-semibold leading-none tracking-[-0.03em] tabular-nums">
        {value}
      </p>
      {note && <p className="mt-3 text-[11.5px] leading-relaxed text-[#657069]">{note}</p>}
    </>
  );

  const className =
    "a-card block p-5" + (href ? " transition-colors hover:border-[#cdd5cf]" : "");

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

const statusStyles: Record<string, string> = {
  AWAITING_CONFIRMATION: "a-pill a-pill-wait",
  CONFIRMED: "a-pill a-pill-ok",
  PAID: "a-pill a-pill-solid",
  DISPATCHED: "a-pill a-pill-neutral",
  CANCELLED: "a-pill a-pill-off",
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
    <span className={statusStyles[status] ?? "a-pill a-pill-neutral"}>
      {statusLabels[status] ?? status}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-5 py-14 text-center text-sm text-[#5e6963]">{children}</p>;
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
