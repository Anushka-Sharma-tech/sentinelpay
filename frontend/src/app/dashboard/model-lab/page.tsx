import { PageHeader } from "@/components/ui/page-header";
import { Status } from "@/components/ui/status";
import { getModelEvaluation } from "@/lib/adapters/analytics";

const stages = [
  ["Request validation", "Validate transaction and historical features against the Pydantic schema.", "The caller must provide meaningful upstream features; the API cannot establish their provenance."],
  ["Feature construction", "Build the model vector in the order recorded by the model manifest.", "Incorrectly generated customer or terminal history can distort the score."],
  ["Model inference", "Run the stored HistGradientBoostingClassifier and return a probability.", "The response reports calibrated as false."],
  ["Risk factors", "Attach deterministic amount, velocity, history, and recipient-novelty explanations.", "Factors explain contextual rules; they are not model feature attribution."],
  ["Decision policy", "Map risk to ALLOW, REVIEW, or BLOCK at 0.25 and 0.60.", "Thresholds are operational policy and require production monitoring."],
  ["Persistence", "Create a session and save the linked risk event through the Supabase admin client.", "The frontend has no mounted endpoint for listing the complete event history."],
] as const;

export default async function ModelLabPage() {
  const evaluation = await getModelEvaluation();
  const metrics = [
    ["Precision", evaluation.precision],
    ["Recall", evaluation.recall],
    ["False-positive cost", evaluation.falsePositiveCost],
  ] as const;

  return (
    <>
      <PageHeader
        eyebrow="System transparency"
        title="Model Lab"
        description="Understand what each pipeline stage contributes—and the limitation that must travel with it."
        actions={<Status level="NEUTRAL">Held-out test</Status>}
      />
      <div className="model-grid">
        {stages.map(([title, description, limitation], index) => (
          <article className="model-stage" key={title}>
            <div className="model-stage-top">
              <span className="model-stage-number">
                STAGE {String(index + 1).padStart(2, "0")}
              </span>
              <Status level="NEUTRAL">Current pipeline</Status>
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
            <small>Limitation: {limitation}</small>
          </article>
        ))}
      </div>
      <div className="evaluation-grid" aria-label="Model evaluation status">
        {metrics.map(([label, value]) => (
          <div className="evaluation-item" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <p className="evaluation-note">
        Held-out test metrics from the committed evaluation report. *The
        false-positive cost uses a ₹50 per-event modeling assumption and is not
        measured merchant economics.
      </p>
    </>
  );
}
