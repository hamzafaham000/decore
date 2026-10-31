"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const KEY = "decore_visitor";

function visitorId() {
  try {
    const existing = window.localStorage.getItem(KEY);
    if (existing) return existing;

    const id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
    return id;
  } catch {
    return null;
  }
}

/** One row per page in /admin/analytics. Silent: never blocks or interrupts. */
export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const visitor = visitorId();

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        visitor,
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
