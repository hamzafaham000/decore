"use client";

import { usePathname } from "next/navigation";

export function AdminTopbar() {
  const pathname = usePathname();

  let label = "Overview";
  if (pathname.startsWith("/admin/products")) label = "Products";
  else if (pathname.startsWith("/admin/orders")) label = "Orders";
  else if (pathname.startsWith("/admin/analytics")) label = "Traffic";

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-[#657069]">Dashboard</span>
      <span className="text-[#cdd5cf]">/</span>
      <span className="font-medium text-[#111815]">{label}</span>
    </div>
  );
}
