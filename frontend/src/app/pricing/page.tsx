import type { Metadata } from "next";
import Link from "next/link";

import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <MarketingLayout>
      <div className="marketing-page">
        <header className="marketing-title">
          <p className="eyebrow">Pricing</p>
          <h1>Evaluation access is currently free.</h1>
          <p>
            SentinelPay is under development and does not currently offer a
            paid production service or claim production readiness.
          </p>
        </header>
        <section className="pricing-panel">
          <div>
            <p className="eyebrow">Demonstration workspace</p>
            <h2>Explore the current product</h2>
          </div>
          <p>
            Review the analyst console, inspect demonstration risk events, and
            run bounded scenarios in Test Lab. No payment is required.
          </p>
          <div className="pricing-list">
            {["Explainable risk-event views", "Investigation workflow", "Interactive demonstration scenarios", "Transparent model-evaluation status"].map((item) => (
              <div key={item}>
                <Icon name="check" width={16} height={16} />
                {item}
              </div>
            ))}
          </div>
          <div>
            <Link className="button" href={routes.dashboard}>
              Open demonstration console
            </Link>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
