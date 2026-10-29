import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="page-shell pb-24 pt-6 md:pt-8">
      <CheckoutForm />
    </div>
  );
}
