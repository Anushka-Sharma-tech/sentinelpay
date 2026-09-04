import type { Metadata } from "next";

import { MarketingLayout } from "@/components/layout/marketing-layout";
import { BackLink } from "@/components/navigation/back-link";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Checkout readiness" };

export default function CheckoutPage() {
  return (
    <MarketingLayout>
      <div className="marketing-page">
        <BackLink href={routes.pricing} label="Back to Pricing" />
        <header className="marketing-title">
          <p className="eyebrow">Checkout readiness</p>
          <h1>No payment flow is connected yet.</h1>
          <p>
            This page documents the intended integration boundary without
            presenting a fake checkout or collecting payment details.
          </p>
        </header>
        <div className="checkout-layout">
          <section className="content-split" style={{ paddingTop: 0 }}>
            <h2>Future flow</h2>
            <div className="prose">
              <p>
                A production integration would create an order on a trusted
                server, open Razorpay Checkout with public order data, and
                verify the payment signature on the server.
              </p>
              <p>
                Razorpay secret keys must never enter the browser bundle. Until
                server-side creation and verification exist, payment remains
                unavailable.
              </p>
            </div>
          </section>
          <aside className="checkout-summary">
            <h2>Current status</h2>
            <div className="checkout-row"><span>Plan</span><strong>Not available</strong></div>
            <div className="checkout-row"><span>Payment provider</span><strong>Not connected</strong></div>
            <div className="checkout-row"><span>Amount due</span><strong>₹0</strong></div>
            <button className="button" type="button" disabled>
              <Icon name="warning" width={16} height={16} />
              Checkout unavailable
            </button>
          </aside>
        </div>
      </div>
    </MarketingLayout>
  );
}
