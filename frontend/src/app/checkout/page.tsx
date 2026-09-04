import type { Metadata } from "next";

import { RazorpayTestOrder } from "@/components/checkout/razorpay-test-order";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { BackLink } from "@/components/navigation/back-link";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Razorpay Test Mode" };

export default function CheckoutPage() {
  return (
    <MarketingLayout>
      <div className="marketing-page">
        <BackLink href={routes.pricing} label="Back to Pricing" />
        <header className="marketing-title">
          <p className="eyebrow">Authenticated sandbox operation</p>
          <h1>Razorpay Test Mode orders.</h1>
          <p>
            Create an order through the current backend contract without
            presenting a fake checkout or collecting payment details.
          </p>
        </header>
        <RazorpayTestOrder />
      </div>
    </MarketingLayout>
  );
}
