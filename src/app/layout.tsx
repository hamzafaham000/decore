import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";

import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { brand } from "@/lib/brand";
import { searchIndex } from "@/lib/search-index";
import { siteJsonLd } from "@/lib/seo";
import { siteLanguage, siteLocale, siteUrl } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

import "./globals.css";

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const homeTitle = `${brand.name} — Furniture & objects, made to order in Pakistan`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: homeTitle,
    template: `%s — ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  category: "Shopping",
  authors: [{ name: brand.name, url: siteUrl }],
  creator: brand.name,
  publisher: brand.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: brand.name,
    locale: siteLocale,
    url: "/",
    title: homeTitle,
    description: brand.description,
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: brand.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f5f3ee",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const enquiryUrl = whatsappLink(`Hello — I would like to ask about a ${brand.name} piece.`);

  return (
    <html lang={siteLanguage} className={`${sans.variable} ${serif.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <JsonLd data={siteJsonLd()} />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-canvas"
        >
          Skip to content
        </a>
        <Header whatsappUrl={enquiryUrl} searchIndex={searchIndex} />
        <main id="content" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
