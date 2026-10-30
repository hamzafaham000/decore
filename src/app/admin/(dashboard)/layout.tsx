import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { ArrowUpRightIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { brand } from "@/lib/brand";

import { logout } from "./actions";

export const instant = false;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-surface px-5 py-7 lg:flex">
        <Link href="/admin" className="flex items-baseline gap-2 px-3">
          <span className="font-display text-2xl tracking-[-0.01em]">{brand.name}</span>
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Dashboard</span>
        </Link>

        <AdminNav />

        <div className="mt-auto space-y-3 px-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink"
          >
            View shop
            <ArrowUpRightIcon className="h-3.5 w-3.5" />
          </Link>

          <p className="truncate text-xs text-muted" title={admin.email}>
            {admin.email}
          </p>

          <form action={logout}>
            <button
              type="submit"
              className="text-xs text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 lg:hidden">
          <Link href="/admin" className="font-display text-xl">
            {brand.name}
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-xs text-muted">
              View shop
            </Link>
            <form action={logout}>
              <button type="submit" className="text-xs text-muted">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="border-b border-line px-4 py-2.5 lg:hidden">
          <AdminNav horizontal />
        </div>

        <main className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-10 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
