import { PageHeader } from "@/components/ui/page-header";

const layers = [
  ["Authenticate", "FastAPI validates a Supabase Bearer token before accepting a protected request."],
  ["Validate", "Pydantic checks the transaction and history features against the current request schema."],
  ["Analyse", "A HistGradientBoostingClassifier returns a probability from zero to one."],
  ["Decide", "Policy thresholds map the score to ALLOW, REVIEW, or BLOCK."],
  ["Persist", "FastAPI creates a session and linked risk event in Supabase."],
  ["Explain", "The response returns signals, factors, model metadata, and persisted identifiers."],
] as const;

export default function DashboardHowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operator guide"
        title="How SentinelPay works"
        description="A concise view of the defensive decision path used throughout the console."
      />
      <div className="pipeline">
        {layers.map(([title, description], index) => (
          <div className="pipeline-step" key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </div>
        ))}
      </div>
      <section className="content-split">
        <h2>Decision thresholds</h2>
        <div className="prose">
          <p>
            Below 0.25, the current policy returns ALLOW. From 0.25 to below
            0.60 it returns REVIEW. At 0.60 and above it returns BLOCK.
          </p>
          <p>
            The review threshold was selected during validation. The block
            threshold is a conservative operational policy, and the API
            currently reports calibrated as false.
          </p>
        </div>
      </section>
    </>
  );
}
