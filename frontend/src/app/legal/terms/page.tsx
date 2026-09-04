import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Project policy"
      title="Terms of use"
      summary="SentinelPay is an under-development defensive security project. These terms describe the demonstration, not a commercial production service."
      sections={[
        {
          title: "Permitted use",
          paragraphs: [
            "Use the project to explore, test, and improve defensive approaches to payment-fraud risk. Do not use it to facilitate fraud, impersonation, surveillance without authority, or harmful activity.",
            "The demonstration output is informational. It is not financial, legal, compliance, or fraud-adjudication advice.",
          ],
        },
        {
          title: "Risk decisions",
          paragraphs: [
            "A risk score is a model output, not proof that fraud occurred. Decisions should be reviewed with relevant evidence, policy, and human judgement.",
            "The repository includes held-out model metrics and an assumed false-positive cost model. They are not production reliability, merchant economics, or a guarantee of future performance.",
          ],
        },
        {
          title: "Availability",
          paragraphs: [
            "Features may change, be incomplete, or become temporarily unavailable as development continues. No uptime, fitness, or production-readiness commitment is offered.",
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
