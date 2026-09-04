import Link from "next/link";

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
        eyebrow="Demonstration events"
        title="Risk events"
        description="Human-readable decisions with supporting signal context and explicit uncertainty."
        actions={<Status level="DEMO">Demo data</Status>}
      />
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
