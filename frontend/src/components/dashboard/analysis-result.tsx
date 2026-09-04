import Link from "next/link";

import { RiskScore } from "@/components/risk/risk-score";
import { Status } from "@/components/ui/status";
import { routes } from "@/lib/routes";
import type { AnalysisResult } from "@/lib/types/risk";
import { formatDecision } from "@/lib/utils";

const evidenceCopy = [
  ["Transaction amount", "Compared with the supplied customer history."],
  ["Transaction timing", "Hour, day and dataset-relative transaction time."],
  ["Customer history", "Prior count, historical mean and standard deviation."],
  ["Terminal activity", "Prior terminal and customer-terminal activity."],
  ["Recipient novelty", "Whether the supplied transaction uses a new recipient."],
] as const;

export function AnalysisResultView({ result }: { result: AnalysisResult }) {
  const score = Math.round(result.risk_score * 100);

  return (
    <section className="analysis-live-result" id="analysis-result">
      <div className="analysis-result-hero">
        <RiskScore score={score} level={result.risk_level} />
        <div>
          <div className="analysis-result-statuses">
            <Status level={result.risk_level} />
            <span className={`decision decision-${result.decision.toLowerCase()}`}>
              {formatDecision(result.decision)}
            </span>
          </div>
          <h2>{formatDecision(result.decision)} recommended</h2>
          <p>
            The transaction model produced this risk score. FastAPI persisted
            the assessment as risk event <span className="mono">{result.event_id}</span>{" "}
            in session <span className="mono">{result.session_id}</span>.
          </p>
        </div>
      </div>

      <div className="analysis-result-grid">
        <section className="detail-section">
          <h3>Evidence used by the current model</h3>
          <div className="factor-list">
            {evidenceCopy.map(([title, description]) => (
              <article className="factor-item" key={title}>
                <div>
                  <span>Available input</span>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="form-message" style={{ marginTop: 20 }}>
            The current live endpoint does not accept audio or conversation
            text. Speech datasets prepared in the project are auxiliary
            research material and do not contribute to this transaction score.
          </div>
        </section>

        <aside className="detail-section">
          <h3>Model and decision</h3>
          <dl className="metadata-list">
            <div>
              <dt>Risk score</dt>
              <dd>{score}%</dd>
            </div>
            <div>
              <dt>Risk level</dt>
              <dd>{result.risk_level}</dd>
            </div>
            <div>
              <dt>Decision</dt>
              <dd>{result.decision}</dd>
            </div>
            <div>
              <dt>Model version</dt>
              <dd>{result.model_version}</dd>
            </div>
            <div>
              <dt>Calibrated</dt>
              <dd>{result.calibrated ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt>Inference latency</dt>
              <dd>{result.latency_ms.toFixed(2)} ms</dd>
            </div>
            <div>
              <dt>Event ID</dt>
              <dd>{result.event_id}</dd>
            </div>
            <div>
              <dt>Session ID</dt>
              <dd>{result.session_id}</dd>
            </div>
          </dl>
          <Link className="button button-secondary" href={routes.riskEvents}>
            View recent events
          </Link>
        </aside>
      </div>
    </section>
  );
}
