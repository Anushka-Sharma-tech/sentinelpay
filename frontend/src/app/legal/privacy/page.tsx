import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Project policy"
      title="Privacy"
      summary="This notice describes the intended handling of information in the SentinelPay project. It does not claim a production privacy programme or certification."
      sections={[
        {
          title: "Current demonstration",
          paragraphs: [
            "The demonstration console uses illustrative risk events stored in the frontend. It does not contain live customer, payment, merchant, or voice data.",
            "If Supabase is not configured, authentication controls operate in an obvious local demonstration mode and do not create a remote account.",
          ],
        },
        {
          title: "Connected services",
          paragraphs: [
            "When Supabase is configured, account information such as email, display name, verification state, and an avatar reference may be processed by that service. Profile images should be stored in user-scoped storage rather than embedded as large authentication metadata.",
            "When the FastAPI service is connected, authenticated transaction and history features are sent to the configured analysis endpoint. Successful responses include identifiers for the session and risk event persisted by the backend.",
            "The currently mounted transaction endpoint does not accept audio. Any future voice-data processing requires a separately reviewed privacy and consent boundary.",
          ],
        },
        {
          title: "Security boundaries",
          paragraphs: [
            "Secret keys, service-role credentials, authorization headers, and private backend configuration must never be displayed or included in browser code.",
            "A production deployment would require documented retention, deletion, access-control, consent, and incident-response practices before handling real personal or financial data.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            "Questions about this project policy can be sent to anushkasharmatech08@gmail.com.",
          ],
        },
      ]}
    />
  );
}
