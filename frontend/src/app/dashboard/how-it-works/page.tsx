import { PageHeader } from "@/components/ui/page-header";

const layers = [
  ["Observe", "Audio and session context enter through authenticated application boundaries."],
  ["Analyse", "Voice, conversation, transaction, and behaviour modules produce bounded signal scores."],
  ["Fuse", "Weighted signals become a combined risk score from zero to one."],
  ["Decide", "Policy thresholds recommend allow, step-up verification, manual review, or escalation."],
  ["Explain", "Reasons, limitations, unavailable evidence, and technical metadata remain attached."],
  ["Review", "An analyst uses the evidence to make a proportionate operational decision."],
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
            Below 0.40, the current policy allows. From 0.40 to 0.69 it asks for
            step-up verification. From 0.70 to 0.84 it recommends manual review.
            At 0.85 and above it escalates.
          </p>
          <p>
            These thresholds describe the implemented baseline policy. They
            require measured evaluation and calibration before production use.
          </p>
        </div>
      </section>
    </>
  );
}
