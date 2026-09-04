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
            <span>Implemented pipeline</span>
            <strong>Under development</strong>
            <p>
              Audio, context, transaction, behaviour, fusion, policy, and
              explanation modules exist in the current backend.
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
            <strong>Not evaluated</strong>
            <p>
              Precision, recall, false-positive cost, and model calibration must
              be established on a held-out test set.
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
              The acoustic component is an audio-classification signal within a
              larger assessment. SentinelPay does not claim that it is a proven
              deepfake detector; that requires task-specific evaluation the
              project has not yet completed.
            </p>
          </div>
        </section>
        <section className="content-split">
          <h2>Multimodal by design</h2>
          <div className="prose">
            <p>
              The architecture checks speech presence, acoustic and prosodic
              characteristics, speaker consistency when a baseline is
              available, conversation triggers, transaction anomalies, and
              behavioural patterns.
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
