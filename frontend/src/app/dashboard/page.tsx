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
        description="Run transaction-risk analysis, review the score and available evidence, and follow the resulting decision through the payment-defense workflow."
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
            The demonstration analyzes structured transaction and historical
            context, persists the result in Supabase, and applies the risk
            decision before the Razorpay Test Mode payment path.
          </p>
        </div>
        <Status level="DEMO">Demo environment</Status>
      </div>
      <section className="metric-strip" aria-label="Backend contract summary">
        <div className="metric">
          <span>Analysis endpoint</span>
          <strong style={{ fontFamily: "inherit", fontSize: 16 }}>
            /api/v1/analyze
          </strong>
          <p>Transaction-risk inference</p>
        </div>
        <div className="metric">
          <span>Persistence</span>
          <strong style={{ fontFamily: "inherit", fontSize: 18 }}>
            Event + session
          </strong>
          <p>Supabase PostgreSQL</p>
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
            <h3>Prediction before intervention</h3>
            <p>
              The model estimates risk; the policy converts that estimate into
              an operational action.
            </p>
            <div className="decision-steps">
              <div><span>01</span><p>Collect structured transaction and history inputs.</p></div>
              <div><span>02</span><p>Run the trained transaction-risk model.</p></div>
              <div><span>03</span><p>Apply the ALLOW / REVIEW / BLOCK policy.</p></div>
              <div><span>04</span><p>Persist the session and risk event for traceability.</p></div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
