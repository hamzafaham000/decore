import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowRightIcon } from "@/components/icons";
import { getAdmin } from "@/lib/auth";
import { brand } from "@/lib/brand";

import { LoginForm } from "./login-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink"
        >
          <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
          {brand.name}
        </Link>

        <h1 className="display-2 mt-8">Dashboard</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Sign in to manage the catalogue, orders and traffic.
        </p>

        <LoginForm />

        <p className="mt-8 text-xs leading-relaxed text-muted">
          Lost the password? Set <code className="text-ink">ADMIN_PASSWORD</code> in the
          environment and run <code className="text-ink">pnpm db:seed</code>.
        </p>
      </div>
    </div>
  );
}
