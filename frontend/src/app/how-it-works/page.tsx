import type { Metadata } from "next";

import { MarketingLayout } from "@/components/layout/marketing-layout";

export const metadata: Metadata = { title: "How it works" };

const stages = [
  ["Audio", "Receives a short voice sample through the protected analysis API."],
  ["Voice activity detection", "Checks whether the sample contains enough meaningful speech to analyse."],
  ["Acoustic analysis", "Produces a bounded audio-classification signal; it is not treated as proof."],
  ["Prosody analysis", "Examines pitch variation and speech dynamics that may add context."],
  ["Speaker consistency", "Compares speaker embeddings only when a trusted baseline is available."],
  ["Transcription", "Converts speech into text for conversation analysis."],
  ["Conversation analysis", "Looks for urgency, impersonation, OTP requests, payment pressure, and remote access."],
  ["Transaction intelligence", "Considers amount deviation, new recipients, and recent payment frequency."],
  ["Behaviour intelligence", "Considers retries, failures, and compressed activity over time."],
  ["Risk fusion", "Weights the six signal families into a bounded combined assessment."],
  ["Decision policy", "Maps risk to allow, step-up verification, manual review, or escalation."],
  ["Explanation", "Returns the reasons, supporting signals, limitations, and technical metadata."],
] as const;

export default function HowItWorksPage() {
  return (
    <MarketingLayout>
      <div className="marketing-page">
        <header className="marketing-title">
          <p className="eyebrow">How it works</p>
          <h1>From a voice sample to an explainable action.</h1>
          <p>
            SentinelPay follows a staged pipeline. Each stage contributes a
            specific type of evidence and passes a bounded result forward.
          </p>
        </header>
        <div className="pipeline">
          {stages.map(([title, description], index) => (
            <div className="pipeline-step" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
