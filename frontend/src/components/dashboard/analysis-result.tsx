import Link from "next/link";

import { RiskScore } from "@/components/risk/risk-score";
import { Status } from "@/components/ui/status";
import { routes } from "@/lib/routes";
import type { AnalysisResult, RiskFactor } from "@/lib/types/risk";
import { formatDecision } from "@/lib/utils";

function formatFactorName(name: string) {
  const labels: Record<string, string> = {
    amount_deviation: "Unusual transaction amount",
    transaction_velocity: "Transaction activity",
    new_customer_history: "Limited customer history",
    new_recipient: "New recipient",
    model_assessment: "Overall model assessment",
  };

  return (
    labels[name] ??
    name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

function formatFactorCategory(category: string) {
  if (category === "transaction") return "Transaction signal";
  if (category === "behaviour") return "Behaviour signal";
  return "Model signal";
}

function formatContribution(contribution: number) {
  return `${Math.round(contribution * 100)}%`;
}

function FactorItem({ factor }: { factor: RiskFactor }) {
  return (
    <article className="factor-item">
      <div className="factor-item-main">
        <div className="factor-item-heading">
          <div>
            <span>{formatFactorCategory(factor.category)}</span>
            <strong>{formatFactorName(factor.name)}</strong>
          </div>
          <b>{formatContribution(factor.contribution)}</b>
        </div>
        <p>{factor.evidence}</p>
      </div>
    </article>
  );
}

export function AnalysisResultView({ result }: { result: AnalysisResult }) {
  const score = Math.round(result.risk_score * 100);
  const decisionLabel = formatDecision(result.decision);

  return (
    <section className="analysis-live-result" id="analysis-result">
      <div className="analysis-result-hero">
        <RiskScore score={score} level={result.risk_level} />

        <div className="analysis-result-hero-copy">
          <div className="analysis-result-statuses">
            <Status level={result.risk_level} />
            <span className={`decision decision-${result.decision.toLowerCase()}`}>
              {decisionLabel}
            </span>
          </div>

          <h2>{decisionLabel} recommended</h2>

          <p>
            SentinelPay evaluated the submitted transaction with the current
            transaction-risk model and produced this recommendation.
          </p>

          <div className="analysis-result-next-step">
            <span>Payment outcome</span>
            <strong>
              {result.decision === "ALLOW"
                ? "Payment can proceed."
                : result.decision === "REVIEW"
                  ? "Payment requires review before proceeding."
                  : "Payment is blocked by the current risk policy."}
            </strong>
          </div>
        </div>
      </div>

      <div className="analysis-result-grid">
        <section className="detail-section analysis-evidence-panel">
          <div className="analysis-section-intro">
            <span className="analysis-section-kicker">Why this result</span>
            <h3>Signals behind the recommendation</h3>
            <p>
              These are the strongest explanatory factors returned for this
              transaction. They help show what the model considered unusual or
              important.
            </p>
          </div>

          {result.factors.length > 0 ? (
            <div className="factor-list">
              {result.factors.map((factor) => (
                <FactorItem factor={factor} key={`${factor.category}-${factor.name}`} />
              ))}
            </div>
          ) : (
            <div className="analysis-empty-copy">
              No additional explanatory factors were returned for this
              assessment.
            </div>
          )}

          <div className="form-message analysis-model-scope">
            <strong>Current model scope</strong>
            <p>
              The live SentinelPay endpoint evaluates transaction and
              contextual inputs. Audio, conversation text, and speech-model
              signals do not contribute to this transaction score.
            </p>
          </div>
        </section>

        <aside className="detail-section analysis-model-panel">
          <div className="analysis-section-intro">
            <span className="analysis-section-kicker">Decision details</span>
            <h3>Model and decision</h3>
            <p>
              The technical details below record how this assessment was
              produced.
            </p>
          </div>

          <dl className="metadata-list">
            <div>
              <dt>Risk score</dt>
              <dd>{score}/100</dd>
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
          </dl>

          <details className="analysis-technical-details">
            <summary>Technical identifiers</summary>

            <dl className="metadata-list metadata-list-technical">
              <div>
                <dt>Event ID</dt>
                <dd>{result.event_id}</dd>
              </div>
              <div>
                <dt>Session ID</dt>
                <dd>{result.session_id}</dd>
              </div>
            </dl>
          </details>

          <Link className="button button-secondary" href={routes.riskEvents}>
            View recent events
          </Link>
        </aside>
      </div>
    </section>
  );
}
