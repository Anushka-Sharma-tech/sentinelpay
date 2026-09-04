import Link from "next/link";

import { RiskScore } from "@/components/risk/risk-score";
import { SignalList } from "@/components/risk/signal-list";
import { Status } from "@/components/ui/status";
import { routes } from "@/lib/routes";
import type {
  AnalysisResult,
  RiskSignal,
  SignalKey,
} from "@/lib/types/risk";
import { formatDecision } from "@/lib/utils";

const signalCopy: Record<
  SignalKey,
  { label: string; summary: string; limitation?: string }
> = {
  acoustic: {
    label: "Acoustic",
    summary: "Score returned by the transaction-analysis endpoint.",
    limitation: "No audio payload is accepted by this endpoint.",
  },
  prosody: {
    label: "Prosody",
    summary: "Score returned by the transaction-analysis endpoint.",
    limitation: "No speech prosody is evaluated by this endpoint.",
  },
  speaker: {
    label: "Speaker",
    summary: "Score returned by the transaction-analysis endpoint.",
    limitation: "No speaker sample or trusted baseline is supplied.",
  },
  context: {
    label: "Conversation context",
    summary: "Score returned by the transaction-analysis endpoint.",
    limitation: "No conversation text is supplied to this endpoint.",
  },
  transaction: {
    label: "Transaction",
    summary: "HistGradientBoostingClassifier transaction probability.",
  },
  behaviour: {
    label: "Behaviour",
    summary: "The backend currently mirrors the transaction probability.",
  },
};

export function AnalysisResultView({ result }: { result: AnalysisResult }) {
  const score = Math.round(result.risk_score * 100);
  const signals: RiskSignal[] = (
    Object.keys(signalCopy) as SignalKey[]
  ).map((key) => ({
    key,
    score: result.signals[key],
    ...signalCopy[key],
  }));

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
            FastAPI persisted this assessment as risk event{" "}
            <span className="mono">{result.event_id}</span> and linked it to
            session <span className="mono">{result.session_id}</span>.
          </p>
        </div>
      </div>

      <div className="analysis-result-grid">
        <section className="detail-section">
          <h3>Risk factors</h3>
          {result.factors.length > 0 ? (
            <div className="factor-list">
              {result.factors.map((factor) => (
                <article
                  className="factor-item"
                  key={`${factor.category}-${factor.name}`}
                >
                  <div>
                    <span>{factor.category}</span>
                    <strong>{factor.name.replaceAll("_", " ")}</strong>
                    <p>{factor.evidence}</p>
                  </div>
                  <b>{Math.round(factor.contribution * 100)}</b>
                </article>
              ))}
            </div>
          ) : (
            <p className="analysis-empty-copy">
              The backend returned no explanatory factors.
            </p>
          )}
        </section>

        <section className="detail-section">
          <h3>Signal scores</h3>
          <SignalList signals={signals} />
        </section>

        <aside className="detail-section">
          <h3>Technical metadata</h3>
          <dl className="metadata-list">
            <div>
              <dt>Event ID</dt>
              <dd>{result.event_id}</dd>
            </div>
            <div>
              <dt>Session ID</dt>
              <dd>{result.session_id}</dd>
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
          <Link className="button button-secondary" href={routes.riskEvents}>
            View recent events
          </Link>
        </aside>
      </div>
    </section>
  );
}
