import { connection } from "next/server";

import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { formatDate } from "@/components/admin/ui";
import { ArrowUpRightIcon } from "@decore/ui";
import { requireAdmin } from "@decore/auth";
import { brand } from "@decore/core";

import { storefrontUrl } from "@/lib/storefront";

import { logout } from "./actions";

export const instant = false;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await connection();

  const admin = await requireAdmin();
  const initial = admin.email.slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen">
      <aside className="a-sidebar fixed inset-y-0 left-0 z-30 hidden w-60 flex-col px-3.5 py-5 lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f0ec] text-[13px] font-semibold text-[#1f513f]">
            D
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-white">{brand.name}</span>
            <span className="block text-[11px] text-white/55">Admin</span>
          </span>
        </Link>

        <div className="mt-7">
          <AdminNav />
        </div>

        <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
          <Link
            href={storefrontUrl}
            target="_blank"
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            View shop
            <ArrowUpRightIcon className="h-3 w-3" />
          </Link>

          <div className="flex items-center gap-2.5 px-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white">
              {initial}
            </span>
            <span className="truncate text-[11px] text-white/55" title={admin.email}>
              {admin.email}
            </span>
          </div>

          <form action={logout} className="px-2.5">
            <button
              type="submit"
              className="text-[11px] text-white/55 transition-colors hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-[#e2e7e3] bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:px-10">
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-sm font-semibold lg:hidden">
              {brand.name}
            </Link>
            <span className="text-[11px] text-[#657069] lg:hidden">Admin</span>
            <div className="hidden lg:block">
              <AdminTopbar />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-[#657069] md:block">{formatDate(new Date())}</span>
            <Link
              href={storefrontUrl}
              target="_blank"
              className="hidden items-center gap-1.5 text-xs font-medium text-[#5e6963] transition-colors hover:text-[#111815] sm:inline-flex"
            >
              View shop
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </Link>
            <form action={logout} className="lg:hidden">
              <button type="submit" className="text-xs text-[#5e6963]">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="border-b border-[#e2e7e3] bg-white px-4 py-2 sm:px-6 lg:hidden">
          <AdminNav horizontal />
        </div>

        <main className="mx-auto w-full max-w-[80rem] px-4 py-7 sm:px-6 lg:px-10 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
