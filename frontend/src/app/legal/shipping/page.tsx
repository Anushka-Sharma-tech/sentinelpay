import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <LegalPage
      eyebrow="Project policy"
      title="Shipping"
      summary="SentinelPay is a software project and does not currently sell or ship physical goods."
      sections={[
        {
          title: "Digital access",
          paragraphs: [
            "The current demonstration is accessed through the web application. Nothing is dispatched by post or courier, and no shipping address is requested.",
            "No delivery estimate or shipping charge applies.",
          ],
        },
        {
          title: "Future changes",
          paragraphs: [
            "If the project later offers a product that requires delivery, the relevant fulfilment area, cost, timing, and support terms will be published before an order can be placed.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            "Questions can be sent to anushkasharmatech08@gmail.com.",
          ],
        },
      ]}
    />
  );
}
