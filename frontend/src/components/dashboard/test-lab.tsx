"use client";

import { FormEvent, useState } from "react";

import { AnalysisResultView } from "@/components/dashboard/analysis-result";
import {
  defaultRequest,
  historyFields,
  type NumberField,
  TransactionField,
  transactionFields,
  transactionPresets,
  validateRequest,
} from "@/components/dashboard/transaction-analysis-fields";
import { Icon } from "@/components/ui/icon";
import { Status } from "@/components/ui/status";
import { saveAnalysis } from "@/lib/analysis-history";
import { analyzeTransaction } from "@/lib/api/analysis";
import { ApiError } from "@/lib/api/client";
import type {
  AnalysisResult,
  TransactionAnalysisRequest,
} from "@/lib/types/risk";

function describeApiError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "Risk analysis failed unexpectedly. Try again.";
  }

  if (error.status === 400 || error.status === 422) {
    return `The backend rejected the transaction: ${error.message}`;
  }

  if (error.status >= 500) {
    return `The backend could not complete the analysis: ${error.message}`;
  }

  return error.message;
}

export function TestLab() {
  const [request, setRequest] =
    useState<TransactionAnalysisRequest>(defaultRequest);

  const [errors, setErrors] = useState<
    Partial<Record<NumberField, string>>
  >({});

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function setNumber(key: NumberField, value: number) {
    setRequest((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
  }

  function applyPreset(nextRequest: TransactionAnalysisRequest) {
    setRequest({ ...nextRequest });
    setErrors({});
    setMessage("");
    setResult(null);
  }

  async function runAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateRequest(request);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setMessage("Correct the highlighted fields before submitting.");
      return;
    }

    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      const analysis = await analyzeTransaction(request);

      saveAnalysis(request, analysis);
      setResult(analysis);

      // Keep the current risk-analysis session available for the
      // next payment-gating phase.
      if (typeof window !== "undefined" && analysis.session_id) {
        window.sessionStorage.setItem(
          "sentinelpay_session_id",
          analysis.session_id,
        );
      }

      window.requestAnimationFrame(() =>
        document
          .getElementById("analysis-result")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
      );
    } catch (error) {
      setMessage(describeApiError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="transaction-lab">
      <aside className="analysis-preset-panel">
        <div className="panel-header">
          <h2>Example inputs</h2>
          <Status level="DEMO">Input only</Status>
        </div>

        <div className="scenario-list">
          {transactionPresets.map((preset) => (
            <button
              className="scenario-button"
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.request)}
            >
              <strong>{preset.label}</strong>
              <span>{preset.description}</span>
            </button>
          ))}
        </div>

        <div className="analysis-contract-note">
          <Icon name="shield" width={18} height={18} />

          <div>
            <strong>SentinelPay demo session</strong>

            <p>
              Analysis runs through{" "}
              <span className="mono">POST /api/v1/analyze</span>{" "}
              and creates a persisted session and risk event.
            </p>
          </div>
        </div>
      </aside>

      <form className="analysis-form-panel" onSubmit={runAnalysis}>
        <div className="analysis-form-header">
          <div>
            <p className="eyebrow">Live transaction inference</p>

            <h2>Analyse a payment</h2>

            <p>
              Enter the transaction and history features accepted by the
              current FastAPI request schema.
            </p>
          </div>

          <Status level="DEMO">Demo Session</Status>
        </div>

        <fieldset className="analysis-fieldset">
          <legend>Transaction context</legend>

          <div className="analysis-field-grid">
            {transactionFields.map((field) => (
              <TransactionField
                definition={field}
                error={errors[field.key]}
                key={field.key}
                value={request[field.key]}
                onChange={(value) => setNumber(field.key, value)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="analysis-fieldset">
          <legend>Customer and terminal history</legend>

          <div className="analysis-field-grid">
            {historyFields.map((field) => (
              <TransactionField
                definition={field}
                error={errors[field.key]}
                key={field.key}
                value={request[field.key]}
                onChange={(value) => setNumber(field.key, value)}
              />
            ))}
          </div>
        </fieldset>

        <label className="analysis-checkbox">
          <input
            type="checkbox"
            checked={request.is_new_recipient}
            onChange={(event) =>
              setRequest((current) => ({
                ...current,
                is_new_recipient: event.target.checked,
              }))
            }
          />

          <span>
            <strong>New recipient</strong>

            <small>
              Include the backend&apos;s recipient-novelty factor when checked.
            </small>
          </span>
        </label>

        {message && (
          <div
            className="form-message form-message-error"
            role="alert"
            aria-live="polite"
          >
            {message}
          </div>
        )}

        <div className="analysis-form-actions">
          <button
            className="button button-secondary"
            type="button"
            disabled={loading}
            onClick={() => applyPreset(defaultRequest)}
          >
            Reset defaults
          </button>

          <button
            className="button"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner" aria-hidden="true" />
                Running inference…
              </>
            ) : (
              <>
                Analyse transaction
                <Icon name="arrow-right" width={16} height={16} />
              </>
            )}
          </button>
        </div>
      </form>

      {result && <AnalysisResultView result={result} />}
    </div>
  );
}