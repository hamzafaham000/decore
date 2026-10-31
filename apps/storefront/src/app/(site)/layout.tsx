import { Suspense } from "react";

import { CartDrawer } from "@/components/cart-drawer";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { brand } from "@decore/core";
import { getSearchIndex } from "@/lib/search-index";
import { siteJsonLd } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const searchIndex = await getSearchIndex();
  const enquiryUrl = whatsappLink(`Hello — I would like to ask about a ${brand.name} piece.`);

  return (
    <>
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
      <Suspense fallback={null}>
        <AnalyticsBeacon />
      </Suspense>
    </>
  );
}
