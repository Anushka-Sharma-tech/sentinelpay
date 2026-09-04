import Link from "next/link";

import { RecentAnalyses } from "@/components/dashboard/recent-analyses";
import { PageHeader } from "@/components/ui/page-header";
import { Status } from "@/components/ui/status";
import { getRiskEvents } from "@/lib/adapters/risk";
import { routes } from "@/lib/routes";
import { formatDecision } from "@/lib/utils";

export default async function RiskEventsPage() {
  const events = await getRiskEvents();

  return (
    <>
      <PageHeader
        eyebrow="Risk event review"
        title="Risk events"
        description="Review event IDs returned by live analysis separately from illustrative investigation records."
      />
      <RecentAnalyses />
      <div className="risk-events-divider">
        <div>
          <h2>Illustrative investigation records</h2>
          <p>
            These examples remain frontend demonstration data and are not read
            from Supabase.
          </p>
        </div>
        <Status level="DEMO">Demo data</Status>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Risk</th>
              <th>Recommended action</th>
              <th>Relevant signal</th>
              <th>Time</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>
                  <span className="table-title">{event.title}</span>
                  <span className="table-subtitle mono">{event.id}</span>
                </td>
                <td><Status level={event.riskLevel} /></td>
                <td>{formatDecision(event.decision)}</td>
                <td>{event.signals[0].summary}</td>
                <td>{event.occurredAt}</td>
                <td>
                  <Link className="table-link" href={routes.riskEvent(event.id)}>
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
