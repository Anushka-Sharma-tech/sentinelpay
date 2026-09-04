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
        description="The intended path for turning a payment session into a reviewable risk event."
        actions={<Status level="DEMO">Not connected</Status>}
      />
      <div className="overview-banner">
        <div>
          <strong>No realtime telemetry is running</strong>
          <p>
            This view explains the target event-delivery architecture without
            simulating production traffic.
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
            A production version needs authenticated payment/session input,
            FastAPI analysis, persisted risk events, and a trusted realtime or
            event-delivery channel.
          </p>
          <p>
            The current backend exposes protected audio analysis, while
            persistence and realtime delivery remain integration boundaries.
            The interface therefore stays explicitly disconnected.
          </p>
        </div>
      </section>
    </>
  );
}
