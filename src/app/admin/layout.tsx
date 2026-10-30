import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s — Dashboard",
  },
  robots: { index: false, follow: false },
};

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

/** The dashboard never needs to appear in search results or previews. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`admin-shell ${sans.variable} ${mono.variable} flex min-h-screen flex-col`}>
      {children}
    </div>
  );
}
