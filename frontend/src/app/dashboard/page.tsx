import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { Status } from "@/components/ui/status";
import { getRiskEvents } from "@/lib/adapters/risk";
import { routes } from "@/lib/routes";
import { formatDecision } from "@/lib/utils";

export default async function DashboardPage() {
  const events = await getRiskEvents();

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Risk operations"
        description="Run authenticated transaction analysis, then review the score, decision, factors, and persisted identifiers."
        actions={
          <Link className="button button-small" href={routes.testLab}>
            Analyse transaction
          </Link>
        }
      />
      <div className="overview-banner">
        <div>
          <strong>Backend-connected transaction workflow</strong>
          <p>
            Live analysis and Razorpay order creation require a Supabase
            session. The event list below remains illustrative.
          </p>
        </div>
        <Status level="NEUTRAL">Protected API</Status>
      </div>
      <section className="metric-strip" aria-label="Backend contract summary">
        <div className="metric">
          <span>Analysis endpoint</span>
          <strong style={{ fontFamily: "inherit", fontSize: 16 }}>
            /api/v1/analyze
          </strong>
          <p>Supabase Bearer authentication</p>
        </div>
        <div className="metric">
          <span>Persistence</span>
          <strong style={{ fontFamily: "inherit", fontSize: 18 }}>
            Event + session
          </strong>
          <p>IDs returned after Supabase writes</p>
        </div>
        <div className="metric">
          <span>Review threshold</span>
          <strong>25</strong>
          <p>Validation-selected operating point</p>
        </div>
        <div className="metric">
          <span>Block threshold</span>
          <strong>60</strong>
          <p>Conservative operational policy</p>
        </div>
      </section>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Illustrative risk events</h2>
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
