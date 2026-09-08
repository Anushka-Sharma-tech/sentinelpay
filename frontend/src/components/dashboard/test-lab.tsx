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
  const [request, setRequest] = useState<TransactionAnalysisRequest>(defaultRequest);
  const [errors, setErrors] = useState<Partial<Record<NumberField, string>>>({});
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function setNumber(key: NumberField, value: number) {
    setRequest((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
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

      if (typeof window !== "undefined" && analysis.session_id) {
        window.sessionStorage.setItem("sentinelpay_session_id", analysis.session_id);
      }

      window.requestAnimationFrame(() =>
        document.getElementById("analysis-result")?.scrollIntoView({
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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start w-full max-w-[1600px] mx-auto">
      
      {/* LEFT SIDEBAR: Presets */}
      <aside className="xl:col-span-3 flex flex-col gap-6 xl:sticky xl:top-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-slate-400">Simulation</h2>
          <Status level="DEMO">Test Env</Status>
        </div>

        <div className="flex flex-col gap-3">
          {transactionPresets.map((preset) => {
            // Determine if active to highlight it subtly
            const isActive = JSON.stringify(request) === JSON.stringify(preset.request);
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.request)}
                className={`text-left p-4 rounded-lg border transition-all duration-200 ${
                  isActive 
                    ? "bg-white/10 border-white/20 shadow-md" 
                    : "bg-[#0a0a0a] border-white/5 hover:bg-white/5 hover:border-white/10"
                }`}
              >
                <strong className={`block text-sm mb-1 ${isActive ? "text-white" : "text-slate-300"}`}>
                  {preset.label}
                </strong>
                <span className="block text-xs text-slate-500 leading-relaxed">
                  {preset.description}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 p-4 bg-[#050505] border border-white/5 rounded-lg flex items-start gap-3">
          <div className="text-blue-500 mt-0.5 shrink-0">
            <Icon name="shield" width={16} height={16} />
          </div>
          <div>
            <strong className="block text-xs text-slate-300 mb-1">SentinelPay Architecture</strong>
            <p className="text-xs text-slate-500 leading-relaxed">
              Analysis runs through <span className="font-mono text-white/40">POST /api/v1/analyze</span> to execute inference against the tabular ML model.
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE: Form & Results */}
      <div className="xl:col-span-9 flex flex-col gap-8">
        <form 
          className="bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl p-6 md:p-8" 
          onSubmit={runAnalysis}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-white/10 pb-6">
            <div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Live inference request</p>
              <h2 className="text-2xl font-serif text-white tracking-tight">Configure Transaction Payload</h2>
            </div>
            <Status level="DEMO">Session Interactive</Status>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Context Fields */}
            <fieldset>
              <legend className="text-sm font-medium text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-white/20 inline-block"></span>
                Transaction Context
              </legend>
              <div className="space-y-4">
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

            {/* History Fields */}
            <fieldset>
              <legend className="text-sm font-medium text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-white/20 inline-block"></span>
                Historical Baselines
              </legend>
              <div className="space-y-4">
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
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-start pt-1">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={request.is_new_recipient}
                  onChange={(event) =>
                    setRequest((current) => ({
                      ...current,
                      is_new_recipient: event.target.checked,
                    }))
                  }
                />
                <div className="w-5 h-5 border border-white/20 rounded bg-white/5 peer-checked:bg-white peer-checked:border-white transition-colors flex items-center justify-center">
                  {request.is_new_recipient && (
                     <Icon name="check" width={14} height={14} className="text-black" />
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <strong className="text-sm text-slate-200 group-hover:text-white transition-colors">Flag as new recipient</strong>
                <span className="text-xs text-slate-500 mt-1">Include the backend&apos;s recipient-novelty factor in this assessment.</span>
              </div>
            </label>
          </div>

          {message && (
            <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg flex items-center gap-3" role="alert" aria-live="polite">
              <Icon name="warning" width={16} height={16} />
              {message}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-white/10">
            <button
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              type="button"
              disabled={loading}
              onClick={() => applyPreset(defaultRequest)}
            >
              Reset to baseline
            </button>

            <button
              className="w-full sm:w-auto px-8 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-md border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-2 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  Processing inference...
                </>
              ) : (
                <>
                  Analyze Transaction
                  <Icon name="arrow-right" width={16} height={16} />
                </>
              )}
            </button>
          </div>
        </form>

        {result && <AnalysisResultView result={result} />}
      </div>
    </div>
  );
}