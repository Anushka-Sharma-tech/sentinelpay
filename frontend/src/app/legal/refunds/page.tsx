import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Refunds" };

export default function RefundsPage() {
  return (
    <LegalPage
      eyebrow="Project policy"
      title="Refunds"
      summary="SentinelPay does not currently sell a paid plan or collect payment through this website."
      sections={[
        {
          title: "Current position",
          paragraphs: [
            "Because no commercial checkout is connected and no fee is charged for demonstration access, there is currently no purchase to refund.",
            "The Razorpay Test Mode page creates test orders only and does not collect card, bank, UPI, or other payment details.",
          ],
        },
        {
          title: "Future paid service",
          paragraphs: [
            "If paid plans are introduced later, the applicable price, billing terms, cancellation process, refund eligibility, and payment-provider handling will be published before purchase.",
            "This page will be revised before any real payment flow becomes available.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            "If you believe a payment related to this project was taken in error, contact anushkasharmatech08@gmail.com with non-sensitive transaction context. Do not email card credentials or one-time passwords.",
          ],
        },
      ]}
    />
  );
}
