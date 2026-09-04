import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { Status } from "@/components/ui/status";
import { getInvestigations, getRiskEvents } from "@/lib/adapters/risk";
import { routes } from "@/lib/routes";
import { formatDecision } from "@/lib/utils";

export default async function DashboardPage() {
  const [events, investigations] = await Promise.all([
    getRiskEvents(),
    getInvestigations(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Risk operations"
        description="Understand what is happening, why it was flagged, and which action needs attention."
      />
      <div className="overview-banner">
        <div>
          <strong>Demonstration environment</strong>
          <p>
            These events are illustrative. No live payment or voice stream is
            connected.
          </p>
        </div>
        <Status level="DEMO">Demo data</Status>
      </div>
      <section className="metric-strip" aria-label="Demonstration summary">
        <div className="metric">
          <span>Demonstration events</span>
          <strong>{events.length}</strong>
          <p>Illustrative records only</p>
        </div>
        <div className="metric">
          <span>Open investigations</span>
          <strong>{investigations.length}</strong>
          <p>Demonstration workflow</p>
        </div>
        <div className="metric">
          <span>Highest risk</span>
          <strong>91</strong>
          <p>Example score, not performance</p>
        </div>
        <div className="metric">
          <span>Model evaluation</span>
          <strong style={{ fontFamily: "inherit", fontSize: 18 }}>
            Not evaluated
          </strong>
          <p>No precision or recall claimed</p>
        </div>
      </section>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Risk events requiring context</h2>
            <Link href={routes.riskEvents}>View all</Link>
          </div>
          <div className="data-list">
            {events.map((event) => (
              <Link
                className="data-list-item"
                href={routes.riskEvent(event.id)}
                key={event.id}
              >
                <div className="data-list-primary">
                  <strong>{event.title}</strong>
                  <p>
                    {event.id} · {event.occurredAt}
                  </p>
                </div>
                <Status level={event.riskLevel} />
                <span className="data-list-value">
                  {formatDecision(event.decision)}
                </span>
                <span className="data-list-action">Review →</span>
              </Link>
            ))}
          </div>
        </section>
        <aside className="panel">
          <div className="panel-header">
            <h2>Decision sequence</h2>
          </div>
          <div className="decision-summary">
            <h3>Evidence before intervention</h3>
            <p>
              The console keeps the recommendation connected to the evidence
              and uncertainty that produced it.
            </p>
            <div className="decision-steps">
              <div><span>01</span><p>Observe bounded multimodal signals.</p></div>
              <div><span>02</span><p>Fuse signals into a risk score.</p></div>
              <div><span>03</span><p>Apply a proportionate decision policy.</p></div>
              <div><span>04</span><p>Explain why and surface what is missing.</p></div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
