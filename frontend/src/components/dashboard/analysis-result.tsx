import Link from "next/link";
import { RiskScore } from "@/components/risk/risk-score";
import { Status } from "@/components/ui/status";
import { routes } from "@/lib/routes";
import type { AnalysisResult, RiskFactor } from "@/lib/types/risk";

function formatFactorName(name: string) {
  const labels: Record<string, string> = {
    amount: "Transaction amount",
    customer_prior_count: "Customer transaction history",
    customer_prior_mean: "Customer historical average",
    customer_prior_std: "Customer historical variation",
    customer_time_since_previous_sec: "Time since previous transaction",
    terminal_prior_count: "Terminal activity",
    customer_terminal_prior_count: "Customer-terminal history",
    TX_TIME_SECONDS: "Transaction time context",
    TX_TIME_DAYS: "Transaction day context",
    is_new_recipient: "New recipient",
    amount_deviation: "Unusual transaction amount",
    transaction_velocity: "Transaction activity",
    new_customer_history: "Limited customer history",
    model_assessment: "Overall model assessment",
  };

  return (
    labels[name] ??
    name.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())
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
    <article className="py-4 border-b border-white/5 last:border-0">
      <div className="flex justify-between items-start mb-1">
        <div>
          <span className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            {formatFactorCategory(factor.category)}
            {/* Progressive disclosure of raw variable */}
            <span className="ml-2 text-white/20 hidden md:inline-block">[{factor.name}]</span>
          </span>
          <strong className="text-slate-200 font-medium">{formatFactorName(factor.name)}</strong>
        </div>
        <b className="text-slate-400 font-mono bg-white/5 px-2 py-1 rounded text-xs">
          {formatContribution(factor.contribution)}
        </b>
      </div>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{factor.evidence}</p>
    </article>
  );
}

export function AnalysisResultView({ result }: { result: AnalysisResult }) {
  const score = Math.round(result.risk_score * 100);

  const decisionConfig = {
    ALLOW: { label: "Allow", text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", consequence: "Payment can proceed." },
    REVIEW: { label: "Review", text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", consequence: "Payment requires review before proceeding." },
    BLOCK: { label: "Block", text: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", consequence: "Payment is blocked by the current risk policy." },
  };

  const config = decisionConfig[result.decision] || decisionConfig.REVIEW;

  return (
    <section className="mt-8 border border-white/10 bg-[#0a0a0a] rounded-xl overflow-hidden shadow-2xl" id="analysis-result">
      {/* 1. HERO: Score, Level, Decision, Consequence */}
      <div className="p-8 border-b border-white/10 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 border-r border-white/5 pr-8">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">Risk Assessment</h3>
            <RiskScore score={score} level={result.risk_level} />
          </div>
          
          <div className="md:col-span-8">
            <div className="flex items-center gap-3 mb-4">
              <Status level={result.risk_level} />
              <span className={`px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full border ${config.text} ${config.bg} ${config.border}`}>
                {config.label}
              </span>
            </div>

            <h2 className="text-2xl font-serif text-white mb-2 tracking-tight">
              {config.label} recommended
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-2xl">
              SentinelPay evaluated the submitted transaction with the current tabular ML risk model and produced this recommendation.
            </p>

            <div className="bg-[#111] border border-white/5 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs font-mono text-slate-500 uppercase">Payment consequence</span>
              <strong className={`text-sm ${config.text}`}>{config.consequence}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. WHY & DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        
        {/* Supporting Signals */}
        <section className="lg:col-span-2 p-8">
          <div className="mb-6">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block mb-2">Why this result</span>
            <h3 className="text-lg font-medium text-white">Signals behind the recommendation</h3>
          </div>

          {result.factors.length > 0 ? (
            <div className="mb-8">
              {result.factors.map((factor) => (
                <FactorItem factor={factor} key={`${factor.category}-${factor.name}`} />
              ))}
            </div>
          ) : (
            <div className="p-4 border border-white/5 bg-white/5 text-slate-400 text-sm rounded-lg mb-8">
              No additional explanatory factors were returned for this assessment.
            </div>
          )}

          <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg">
            <strong className="block text-sm text-blue-400 mb-1">Model scope boundary</strong>
            <p className="text-xs text-blue-200/70 leading-relaxed">
              The live SentinelPay endpoint evaluates transaction and contextual tabular inputs. Audio, conversation text, and TeleAntiFraud speech-model signals do not contribute to this live transaction score.
            </p>
          </div>
        </section>

        {/* Model Audit Details */}
        <aside className="p-8 bg-[#050505]">
          <div className="mb-6">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block mb-2">Audit Log</span>
            <h3 className="text-lg font-medium text-white">Technical metadata</h3>
          </div>

          <dl className="space-y-4 mb-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <dt className="text-sm text-slate-400">Risk level</dt>
              <dd className="text-sm font-mono text-white">{result.risk_level}</dd>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <dt className="text-sm text-slate-400">Model version</dt>
              <dd className="text-sm font-mono text-white">{result.model_version}</dd>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <dt className="text-sm text-slate-400">Calibrated</dt>
              <dd className="text-sm font-mono text-white">{result.calibrated ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <dt className="text-sm text-slate-400">Inference latency</dt>
              <dd className="text-sm font-mono text-white">{result.latency_ms.toFixed(2)} ms</dd>
            </div>
          </dl>

          <details className="group mb-8">
            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300 font-mono uppercase tracking-widest mb-4 transition-colors">
              Session Identifiers
            </summary>
            <dl className="space-y-3 p-4 bg-[#0a0a0a] border border-white/5 rounded-md">
              <div>
                <dt className="text-xs text-slate-500 mb-1">Event ID</dt>
                <dd className="text-xs font-mono text-slate-300 break-all">{result.event_id}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 mb-1">Session ID</dt>
                <dd className="text-xs font-mono text-slate-300 break-all">{result.session_id}</dd>
              </div>
            </dl>
          </details>

          <Link 
            href={routes.riskEvents}
            className="block w-full text-center px-4 py-3 border border-white/10 bg-transparent hover:bg-white/5 text-slate-300 text-sm font-medium rounded-md transition-all"
          >
            View recent events
          </Link>
        </aside>
      </div>
    </section>
  );
}