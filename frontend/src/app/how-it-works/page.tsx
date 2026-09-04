import type { Metadata } from "next";

import { MarketingLayout } from "@/components/layout/marketing-layout";

export const metadata: Metadata = { title: "How it works" };

const stages = [
  ["Authenticate", "Validates the browser's Supabase access token before accepting a protected request."],
  ["Validate", "Checks the transaction, customer-history, and terminal-history fields against the FastAPI schema."],
  ["Analyse", "Runs the HistGradientBoostingClassifier and produces a probability from zero to one."],
  ["Decide", "Maps the probability to LOW, MEDIUM, or HIGH and ALLOW, REVIEW, or BLOCK."],
  ["Persist", "Creates a Supabase session and stores a linked risk-event record."],
  ["Explain", "Returns factors, six signal fields, model metadata, latency, event ID, and session ID."],
] as const;

export default function HowItWorksPage() {
  return (
    <MarketingLayout>
      <div className="marketing-page">
        <header className="marketing-title">
          <p className="eyebrow">How it works</p>
          <h1>From transaction context to a persisted decision.</h1>
          <p>
            This is the path exposed by the currently mounted backend API.
            Audio and speech modalities remain a product direction, not part of
            the live transaction request.
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
