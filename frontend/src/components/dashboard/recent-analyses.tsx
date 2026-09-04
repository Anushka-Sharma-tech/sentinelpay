"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Status } from "@/components/ui/status";
import {
  getAnalysisHistorySnapshot,
  readAnalysisHistory,
  subscribeToAnalysisHistory,
} from "@/lib/analysis-history";
import { routes } from "@/lib/routes";
import { formatDecision } from "@/lib/utils";

export function RecentAnalyses() {
  useSyncExternalStore(
    subscribeToAnalysisHistory,
    getAnalysisHistorySnapshot,
    () => "",
  );
  const analyses = readAnalysisHistory();

  return (
    <section className="recent-analyses">
      <div className="panel-header">
        <div>
          <h2>Backend-persisted events from this browser</h2>
          <p>
            FastAPI returned these event IDs after writing each analysis to
            Supabase.
          </p>
        </div>
        <Link href={routes.testLab}>Analyse transaction</Link>
      </div>
      {analyses.length > 0 ? (
        <div className="recent-analysis-list">
          {analyses.map(({ request, result, submittedAt }) => (
            <article className="recent-analysis-item" key={result.event_id}>
              <div>
                <span className="mono">{result.event_id}</span>
                <strong>
                  ₹{request.amount.toLocaleString("en-IN")} transaction
                </strong>
                <p>
                  Session {result.session_id} ·{" "}
                  {new Date(submittedAt).toLocaleString()}
                </p>
              </div>
              <Status level={result.risk_level} />
              <span className={`decision decision-${result.decision.toLowerCase()}`}>
                {formatDecision(result.decision)}
              </span>
              <b>{Math.round(result.risk_score * 100)}</b>
            </article>
          ))}
        </div>
      ) : (
        <div className="recent-analysis-empty">
          <strong>No live analyses in this browser yet</strong>
          <p>
            Submit an authenticated transaction to receive a persisted event
            and session ID. The backend does not currently expose an event-list
            endpoint, so the frontend cannot query the full Supabase history.
          </p>
          <Link className="button button-secondary" href={routes.testLab}>
            Open Transaction Test Lab
          </Link>
        </div>
      )}
    </section>
  );
}
