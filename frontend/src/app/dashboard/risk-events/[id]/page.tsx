import { notFound } from "next/navigation";

import { BackLink } from "@/components/navigation/back-link";
import { RiskScore } from "@/components/risk/risk-score";
import { SignalList } from "@/components/risk/signal-list";
import { Status } from "@/components/ui/status";
import { getRiskEvent } from "@/lib/adapters/risk";
import { routes } from "@/lib/routes";
import { formatDecision } from "@/lib/utils";

export default async function RiskEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getRiskEvent(id);
  if (!event) notFound();

  return (
    <>
      <BackLink href={routes.riskEvents} label="Back to Risk events" />
      <section className="detail-hero">
        <RiskScore score={event.riskScore} level={event.riskLevel} />
        <div>
          <Status level={event.riskLevel} />
          <h1>{event.title}</h1>
          <p>{event.summary}</p>
        </div>
        <div className="detail-decision">
          <span>Recommended action</span>
          <strong>{formatDecision(event.decision)}</strong>
        </div>
      </section>
      <div className="detail-layout">
        <div>
          <section className="detail-section">
            <h2>Why it was flagged</h2>
            <ul className="explanation-list">
              {event.explanations.map((explanation) => (
                <li key={explanation}>{explanation}</li>
              ))}
            </ul>
          </section>
          <section className="detail-section">
            <h2>Supporting signals</h2>
            <SignalList signals={event.signals} />
          </section>
        </div>
        <aside>
          <section className="detail-section">
            <h2>Unavailable or uncertain evidence</h2>
            <ul className="explanation-list">
              {event.unavailableEvidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="detail-section">
            <h2>Technical metadata</h2>
            <dl className="metadata-list">
              <div><dt>Event ID</dt><dd>{event.id}</dd></div>
              <div><dt>Session ID</dt><dd>{event.sessionId}</dd></div>
              <div><dt>Investigation</dt><dd>{event.investigationId || "Not opened"}</dd></div>
              <div><dt>Model version</dt><dd>{event.modelVersion}</dd></div>
              <div><dt>Amount</dt><dd>{event.amount}</dd></div>
              <div><dt>Occurred</dt><dd>{event.occurredAt}</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}
