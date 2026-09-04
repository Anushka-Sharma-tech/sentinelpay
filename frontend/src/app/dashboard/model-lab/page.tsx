import { PageHeader } from "@/components/ui/page-header";
import { Status } from "@/components/ui/status";
import { getModelEvaluation } from "@/lib/adapters/analytics";

const stages = [
  ["Audio and speech", "Validate the sample and confirm meaningful speech is present.", "Poor audio or insufficient speech can limit every downstream signal."],
  ["Acoustic analysis", "Produce a bounded audio-classification contribution.", "This has not been evaluated as a deepfake detector."],
  ["Prosody", "Examine pitch, rhythm, and variation that may add contextual evidence.", "Prosody varies naturally and must not be treated as proof of deception."],
  ["Speaker consistency", "Compare the speaker with a trusted baseline when one exists.", "Without a baseline, the backend uses a neutral score rather than claiming mismatch."],
  ["Transcription and context", "Translate speech and identify social-engineering patterns.", "Transcription errors, language, and phrasing can affect context detection."],
  ["Transaction intelligence", "Assess amount deviation, recipient novelty, and frequency.", "Meaningful scoring requires reliable account history."],
  ["Behaviour intelligence", "Consider retries, failures, and compressed activity.", "Sparse or incomplete activity can reduce confidence."],
  ["Risk fusion", "Combine acoustic, prosody, speaker, context, behaviour, and transaction signals.", "Weights require evaluation and calibration before production use."],
  ["Decision policy", "Map risk to allow, verify, review, or escalate.", "Thresholds are policy choices, not universal definitions of fraud."],
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
        actions={<Status level="DEMO">Baseline architecture</Status>}
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
            <strong>{value === null ? "Not evaluated" : value}</strong>
          </div>
        ))}
      </div>
    </>
  );
}
