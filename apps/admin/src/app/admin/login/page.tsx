import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowRightIcon } from "@decore/ui";
import { getAdmin } from "@decore/auth";
import { brand } from "@decore/core";

import { storefrontUrl } from "@/lib/storefront";

import { LoginForm } from "./login-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_28rem] xl:grid-cols-[minmax(0,1fr)_32rem]">
      <div className="a-sidebar hidden flex-col justify-between p-10 lg:flex">
        <Link href={storefrontUrl} className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f0ec] text-[13px] font-semibold text-[#1f513f]">
            D
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-white">{brand.name}</span>
            <span className="block text-[11px] text-white/55">Admin</span>
          </span>
        </Link>

        <div>
          <p className="max-w-xs text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] text-white">
            Products, orders and traffic.
          </p>
          <p className="mt-3 max-w-[17rem] text-sm leading-relaxed text-white/60">
            One place to run the shop, from the catalogue to the last reply.
          </p>
        </div>

        <p className="text-[11px] text-white/50">{brand.name} · Dashboard</p>
      </div>

      <div className="flex items-center justify-center px-5 py-14 sm:px-10">
        <div className="w-full max-w-[22rem]">
          <Link href={storefrontUrl} className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#121a16] text-[13px] font-semibold text-white">
              D
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold">{brand.name}</span>
              <span className="block text-[11px] text-[#657069]">Admin</span>
            </span>
          </Link>

          <h1 className="text-xl font-semibold tracking-[-0.02em]">Sign in</h1>
          <p className="mt-1 text-[13px] text-[#5e6963]">
            Manage products, orders and traffic.
          </p>

          <LoginForm />

          <p className="mt-6 text-[11px] leading-relaxed text-[#657069]">
            Locked out? Set <code className="a-code text-[#5e6963]">ADMIN_PASSWORD</code> in the
            environment and run <code className="a-code text-[#5e6963]">pnpm db:seed</code>.
          </p>

          <Link
            href={storefrontUrl}
            className="mt-8 inline-flex items-center gap-1.5 text-xs font-medium text-[#5e6963] transition-colors hover:text-[#111815]"
          >
            Back to shop
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
