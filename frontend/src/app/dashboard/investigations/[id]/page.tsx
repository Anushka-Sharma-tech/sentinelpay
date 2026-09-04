import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/navigation/back-link";
import { RiskScore } from "@/components/risk/risk-score";
import { Status } from "@/components/ui/status";
import { getInvestigation, getRiskEvent } from "@/lib/adapters/risk";
import { routes } from "@/lib/routes";

export default async function InvestigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const investigation = await getInvestigation(id);
  if (!investigation) notFound();
  const event = await getRiskEvent(investigation.eventIds[0]);

  return (
    <>
      <BackLink href={routes.investigations} label="Back to Investigations" />
      <section className="detail-hero">
        <RiskScore score={event?.riskScore || 0} level={investigation.riskLevel} />
        <div>
          <Status level={investigation.riskLevel} />
          <h1>{investigation.title}</h1>
          <p>{investigation.summary}</p>
        </div>
        <div className="detail-decision">
          <span>Recommended action</span>
          <strong>{investigation.recommendedAction}</strong>
        </div>
      </section>
      <div className="detail-layout">
        <div>
          <section className="detail-section">
            <h2>Evidence and events</h2>
            {event ? (
              <Link className="data-list-item" href={routes.riskEvent(event.id)}>
                <div className="data-list-primary">
                  <strong>{event.title}</strong>
                  <p>{event.summary}</p>
                </div>
                <Status level={event.riskLevel} />
                <span className="data-list-value">{event.amount}</span>
                <span className="data-list-action">Review event →</span>
              </Link>
            ) : (
              <p className="data-list-value">No linked event is available.</p>
            )}
          </section>
          <section className="detail-section">
            <h2>Activity timeline</h2>
            <div className="timeline">
              {investigation.timeline.map((entry) => (
                <div className="timeline-item" key={`${entry.time}-${entry.title}`}>
                  <span className="timeline-dot" />
                  <span className="timeline-time">{entry.time}</span>
                  <div className="timeline-copy">
                    <strong>{entry.title}</strong>
                    <p>{entry.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside>
          <section className="detail-section">
            <h2>Investigation state</h2>
            <dl className="metadata-list">
              <div><dt>Status</dt><dd>{investigation.status}</dd></div>
              <div><dt>Last activity</dt><dd>{investigation.lastActivity}</dd></div>
              <div><dt>Investigation ID</dt><dd>{investigation.id}</dd></div>
              <div><dt>Linked events</dt><dd>{investigation.eventIds.length}</dd></div>
            </dl>
          </section>
          <section className="detail-section">
            <h2>Notes</h2>
            <p className="data-list-value">
              Notes editing is unavailable until investigation persistence is
              connected. This demonstration keeps the current backend intact.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
