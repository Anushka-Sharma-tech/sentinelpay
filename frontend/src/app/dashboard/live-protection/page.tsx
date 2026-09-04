import { PageHeader } from "@/components/ui/page-header";
import { Status } from "@/components/ui/status";

const nodes = [
  "Payment / session",
  "FastAPI",
  "SentinelAnalyzer",
  "Risk fusion",
  "Risk event",
  "Realtime delivery",
  "Live Protection",
];

export default function LiveProtectionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Demonstration stream"
        title="Live Protection"
        description="The current authenticated path from transaction features to a persisted risk event."
        actions={<Status level="NEUTRAL">HTTP request flow</Status>}
      />
      <div className="overview-banner">
        <div>
          <strong>Transaction analysis is connected; streaming is not</strong>
          <p>
            FastAPI creates a Supabase session and risk event for each accepted
            request. No realtime event feed is mounted.
          </p>
        </div>
      </div>
      <section className="architecture-flow" aria-label="Intended event flow">
        {nodes.map((node, index) => (
          <div style={{ display: "contents" }} key={node}>
            <div className="architecture-node">{node}</div>
            {index < nodes.length - 1 && (
              <span className="architecture-arrow" aria-hidden="true">→</span>
            )}
          </div>
        ))}
      </section>
      <section className="content-split">
        <h2>Connection requirements</h2>
        <div className="prose">
          <p>
            The mounted transaction endpoint accepts model features, validates
            a Supabase Bearer token, performs inference, then creates linked
            session and risk-event records.
          </p>
          <p>
            Supabase persistence exists, but no authenticated event-list or
            realtime-delivery endpoint is mounted. Full history therefore
            remains a backend-dependent boundary.
          </p>
        </div>
      </section>
    </>
  );
}
