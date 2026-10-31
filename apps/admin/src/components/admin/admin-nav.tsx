"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BagIcon, CardIcon, GridIcon, SparkIcon } from "@decore/ui";

const links = [
  { href: "/admin", label: "Overview", icon: GridIcon },
  { href: "/admin/products", label: "Products", icon: BagIcon },
  { href: "/admin/orders", label: "Orders", icon: CardIcon },
  { href: "/admin/analytics", label: "Traffic", icon: SparkIcon },
];

export function AdminNav({ horizontal = false }: { horizontal?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard"
      className={horizontal ? "flex gap-1 overflow-x-auto" : "a-nav"}
    >
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={horizontal ? "a-mobile-tab" : "a-nav-link"}
          >
            <Icon />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
