import type { Metadata } from "next";

import { MarketingLayout } from "@/components/layout/marketing-layout";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <MarketingLayout>
      <div className="marketing-page">
        <header className="marketing-title">
          <p className="eyebrow">About SentinelPay</p>
          <h1>Defensive intelligence for a human problem.</h1>
          <p>
            SentinelPay explores how voice and payment context can help surface
            social-engineering risk before a transfer becomes an irreversible
            loss.
          </p>
        </header>
        <div className="fact-grid">
          <div>
            <span>Mounted analysis</span>
            <strong>Transaction model</strong>
            <p>
              The current protected endpoint scores transaction features,
              explains factors, and persists linked session and risk-event IDs.
            </p>
          </div>
          <div>
            <span>Production realtime</span>
            <strong>Not connected</strong>
            <p>
              The project does not currently claim a production payment stream
              or complete realtime delivery system.
            </p>
          </div>
          <div>
            <span>Measured evaluation</span>
            <strong>Held-out test reported</strong>
            <p>
              Repository-backed metrics retain their threshold and cost
              assumptions rather than implying production performance.
            </p>
          </div>
        </div>
        <section className="content-split">
          <h2>The problem</h2>
          <div className="prose">
            <p>
              Voice-assisted social engineering can persuade a legitimate
              account holder to move money under false pretences. The payment
              may pass ordinary identity checks because the user is genuinely
              present and authorising it.
            </p>
            <p>
              Useful evidence can exist across the conversation, voice
              characteristics, transaction pattern, and surrounding behaviour.
              SentinelPay brings those signals together without presenting any
              one model as definitive.
            </p>
          </div>
        </section>
        <section className="content-split">
          <h2>Purpose and boundaries</h2>
          <div className="prose">
            <p>
              The product is strictly defensive. Its purpose is to help review
              suspicious payment sessions, recommend bounded safeguards, and
              provide an audit-friendly explanation of the risk decision.
            </p>
            <p>
              Audio and speech remain part of the broader research direction
              but are not accepted by the currently mounted transaction
              endpoint. SentinelPay does not claim to be a proven deepfake
              detector.
            </p>
          </div>
        </section>
        <section className="content-split">
          <h2>Multimodal by design</h2>
          <div className="prose">
            <p>
              The intended architecture spans speech, conversation,
              transaction, and behavioural evidence. The current live contract
              uses transaction and historical activity features.
            </p>
            <p>
              Missing evidence remains visible. If a trusted speaker baseline
              or production history is unavailable, the interface says so
              rather than fabricating confidence.
            </p>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
