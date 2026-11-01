import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s — Dashboard",
  },
  robots: { index: false, follow: false },
};

/**
 * Self-hosted on purpose. Fetching Geist from Google Fonts at build time is a
 * network dependency the dashboard does not need, and it fails behind some
 * proxies — leaving the dashboard on a fallback face. These are the latin
 * variable cuts from the official release (SIL OFL).
 */
const Geist = localFont({
  src: "./fonts/Geist-Variable.woff2",
  weight: "100 900",
  variable: "--font-geist-sans",
  display: "swap",
  // Name the family so devtools and computed styles read `Geist`, not the const.
  declarations: [{ prop: "font-family", value: "Geist" }],
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const GeistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  weight: "100 900",
  variable: "--font-geist-mono",
  display: "swap",
  declarations: [{ prop: "font-family", value: "GeistMono" }],
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});

/** The dashboard never needs to appear in search results or previews. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${Geist.variable} ${GeistMono.variable} h-full`}>
      <body className="min-h-full">
        <div className="admin-shell flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
