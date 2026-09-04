"use client";

import { useState } from "react";

import { RiskScore } from "@/components/risk/risk-score";
import { Icon } from "@/components/ui/icon";
import { Status } from "@/components/ui/status";
import { demoRiskEvents } from "@/data/demo/risk";
import { analyzeAudio } from "@/lib/api/analysis";
import { createClient } from "@/lib/supabase/browser";
import type { AnalysisResult } from "@/lib/types/risk";
import { formatDecision } from "@/lib/utils";

type RunState = "idle" | "running" | "complete";

export function TestLab() {
  const [selected, setSelected] = useState(0);
  const [state, setState] = useState<RunState>("idle");
  const event = demoRiskEvents[selected];

  function runScenario() {
    setState("running");
    window.setTimeout(() => setState("complete"), 1400);
  }

  return (
    <>
      <div className="lab-layout">
        <section className="panel">
        <div className="panel-header">
          <h2>Demonstration scenarios</h2>
        </div>
        <div className="scenario-list">
          {demoRiskEvents.map((scenario, index) => (
            <button
              className={`scenario-button ${selected === index ? "scenario-button-active" : ""}`}
              key={scenario.id}
              type="button"
              onClick={() => {
                setSelected(index);
                setState("idle");
              }}
            >
              <strong>{scenario.title}</strong>
              <span>{scenario.summary}</span>
            </button>
          ))}
        </div>
        </section>
        <section className="lab-workspace">
        <div className="lab-workspace-header">
          <strong>Scenario workspace</strong>
          <Status level="DEMO">Demo data</Status>
        </div>
        <div className="lab-workspace-body">
          {state === "idle" && (
            <div className="lab-empty">
              <span className="lab-empty-icon">
                <Icon name="lab" width={24} height={24} />
              </span>
              <h2>{event.title}</h2>
              <p>
                Run this bounded scenario to preview how the decision,
                contributing reasons, and limitations are presented.
              </p>
              <button className="button" type="button" onClick={runScenario}>
                Run scenario
                <Icon name="arrow-right" width={16} height={16} />
              </button>
            </div>
          )}
          {state === "running" && (
            <div className="lab-running" role="status">
              <span className="lab-running-icon">
                <Icon name="pulse" width={24} height={24} />
              </span>
              <h2>Assembling risk evidence</h2>
              <p>
                Combining demonstration context, transaction, behaviour, and
                audio signals.
              </p>
              <div className="lab-progress"><span /></div>
            </div>
          )}
          {state === "complete" && (
            <div className="lab-result">
              <div className="lab-result-summary">
                <RiskScore score={event.riskScore} level={event.riskLevel} />
                <div>
                  <Status level={event.riskLevel} />
                  <h2>{event.title}</h2>
                  <p>
                    Recommended action: {formatDecision(event.decision)}. This
                    result is pre-authored demonstration data, not a live model
                    inference.
                  </p>
                </div>
              </div>
              <div className="lab-result-reasons">
                {event.signals.slice(0, 3).map((signal) => (
                  <div key={signal.key}>
                    <span>{signal.summary}</span>
                    <strong>
                      {signal.score === null
                        ? "N/A"
                        : Math.round(signal.score * 100)}
                    </strong>
                  </div>
                ))}
              </div>
              <div className="lab-result-actions">
                <button className="button" type="button" onClick={runScenario}>
                  Run again
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setState("idle")}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
        </section>
      </div>
      <AudioAnalysisPanel />
    </>
  );
}

function AudioAnalysisPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function runAnalysis() {
    if (!file) return;
    setLoading(true);
    setMessage("");
    setResult(null);

    const supabase = createClient();
    if (!supabase) {
      setMessage(
        "Real analysis requires Supabase authentication and the FastAPI service. Demonstration scenarios remain available above.",
      );
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setMessage("Sign in before sending audio to the protected analysis API.");
      setLoading(false);
      return;
    }

    try {
      setResult(await analyzeAudio(file, session.access_token));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Audio analysis failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  const score = result
    ? Math.round(result.risk_score <= 1 ? result.risk_score * 100 : result.risk_score)
    : 0;

  return (
    <section className="analysis-upload">
      <div>
        <p className="eyebrow">Connected analysis</p>
        <h2>Analyse an authenticated audio sample</h2>
        <p>
          Sends only the selected file to the configured FastAPI endpoint. The
          backend accepts a maximum of 2 MB.
        </p>
      </div>
      <div className="analysis-upload-control">
        <label className="file-trigger">
          Choose audio file
          <input
            type="file"
            accept="audio/*"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setResult(null);
              setMessage("");
            }}
          />
        </label>
        <span>{file ? file.name : "No file selected"}</span>
        <button
          className="button button-small"
          type="button"
          disabled={!file || loading}
          onClick={runAnalysis}
        >
          {loading ? "Analysing…" : "Analyse audio"}
        </button>
      </div>
      {message && <div className="form-message" role="status">{message}</div>}
      {result && (
        <div className="analysis-result">
          <RiskScore score={score} level={result.risk_level} compact />
          <div>
            <Status level={result.risk_level} />
            <h3>{formatDecision(result.decision)}</h3>
            <p>{result.explanations.join(" ")}</p>
          </div>
          <dl className="metadata-list">
            <div><dt>Model</dt><dd>{result.model_version}</dd></div>
            <div><dt>Latency</dt><dd>{result.latency_ms} ms</dd></div>
          </dl>
        </div>
      )}
    </section>
  );
}
