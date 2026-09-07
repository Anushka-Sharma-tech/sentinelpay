import Link from "next/link";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { IntroOverlay } from "@/components/marketing/intro-overlay";
import { RiskScore } from "@/components/risk/risk-score";
import { Icon } from "@/components/ui/icon";
import { Status } from "@/components/ui/status";
import { routes } from "@/lib/routes";

const riskDomains = [
  [
    "01",
    "Transaction intelligence",
    "Evaluates amount, time, customer history, terminal activity, velocity, and recipient novelty.",
  ],
  [
    "02",
    "Risk scoring",
    "A trained HistGradientBoostingClassifier produces a transaction-risk probability.",
  ],
  [
    "03",
    "Decision policy",
    "Converts the model score into LOW / ALLOW, MEDIUM / REVIEW, or HIGH / BLOCK.",
  ],
  [
    "04",
    "Explainable evidence",
    "Shows the supplied risk factors and keeps the model decision distinguishable from certainty of fraud.",
  ],
  [
    "05",
    "Audit trail",
    "Persists sessions and risk events in Supabase so each analysis has traceable identifiers.",
  ],
  [
    "06",
    "Payment defense",
    "Razorpay Test Mode order creation is gated by the risk decision; REVIEW and BLOCK do not proceed automatically.",
  ],
] as const;

export default function HomePage() {
  return (
    <MarketingLayout>
      <IntroOverlay />
      
      <main className="w-full max-w-[1200px] mx-auto px-6 md:px-8 pb-32">
        
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center min-h-[85vh] py-20">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="font-mono text-xs text-blue-400 uppercase tracking-widest font-semibold mb-6">
              Defensive payment-risk intelligence
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif text-white leading-[1.05] tracking-tight mb-8 text-balance">
              Detect transaction risk before <em className="italic text-blue-400 not-italic">payment creation.</em>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-lg mb-10 text-balance">
              SentinelPay evaluates transaction and historical context with a trained machine-learning model, explains the available evidence, persists the decision, and applies an explicit payment-defense policy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href={routes.dashboard}
                className="inline-flex h-12 items-center justify-center gap-3 px-6 bg-blue-500 hover:bg-blue-400 text-slate-950 text-sm font-bold rounded-md transition-colors"
              >
                Explore the console
                <Icon name="arrow-right" width={16} height={16} />
              </Link>
              <Link 
                href={routes.howItWorks}
                className="inline-flex h-12 items-center justify-center px-6 bg-transparent border border-slate-700 hover:border-slate-500 hover:bg-white/5 text-white text-sm font-medium rounded-md transition-all"
              >
                See how it works
              </Link>
            </div>
          </div>

          {/* HERO PROOF CARD */}
          <div className="lg:col-span-6 relative w-full max-w-xl lg:ml-auto">
            <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full z-0 pointer-events-none" />
            <div className="relative z-10 bg-[#0b0f16] border border-white/10 rounded-2xl p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-6">
                <Status level="DEMO">Demonstration decision</Status>
                <span className="font-mono text-xs text-slate-500 tracking-widest">MODEL V1</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-8 items-center mb-8">
                <RiskScore score={91} level="HIGH" compact />
                <div>
                  <div className="mb-3">
                    <Status level="HIGH" />
                  </div>
                  <h2 className="text-2xl font-serif text-white mb-2">High transaction risk</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Recommended action: block payment creation and require review.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                {[
                  ["Transaction intelligence", 88],
                  ["Customer / terminal history", 81],
                  ["Decision policy", 91],
                ].map(([label, value]) => (
                  <div className="grid grid-cols-[1fr_100px_40px] items-center gap-4 text-xs" key={label}>
                    <span className="text-slate-400">{label}</span>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${value}%` }} />
                    </div>
                    <span className="font-mono text-slate-500 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* THE PROBLEM */}
        <section className="py-24 border-t border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs text-blue-400 uppercase tracking-widest font-semibold mb-4">The problem</p>
              <h2 className="text-4xl sm:text-5xl font-serif text-white leading-tight">A valid payment can still be risky.</h2>
            </div>
            <div className="lg:col-span-7 lg:pl-12">
              <p className="text-slate-400 text-lg leading-relaxed text-balance">
                Payment fraud creates an asymmetric decision problem. Blocking legitimate payments creates friction, while allowing fraudulent transactions can expose the merchant to financial loss. SentinelPay turns available transaction context into a measurable risk score and a bounded operational action.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0b0f16] border border-white/5 rounded-xl p-8 shadow-lg">
              <span className="font-mono text-xs text-blue-400 mb-6 block">01 / DETECT</span>
              <h3 className="text-xl font-serif text-white mb-4">Estimate transaction risk</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Use transaction amount, timing, customer history, terminal activity, and related behavioral context as structured model inputs.
              </p>
            </div>
            <div className="bg-[#0b0f16] border border-white/5 rounded-xl p-8 shadow-lg">
              <span className="font-mono text-xs text-blue-400 mb-6 block">02 / EXPLAIN</span>
              <h3 className="text-xl font-serif text-white mb-4">Make the result inspectable</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Surface the factors that can be derived from the supplied input instead of presenting an unexplained probability.
              </p>
            </div>
            <div className="bg-[#0b0f16] border border-white/5 rounded-xl p-8 shadow-lg">
              <span className="font-mono text-xs text-blue-400 mb-6 block">03 / DEFEND</span>
              <h3 className="text-xl font-serif text-white mb-4">Gate payment creation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                A risk prediction becomes useful only when it is connected to an explicit policy and a downstream payment control.
              </p>
            </div>
          </div>
        </section>

        {/* CURRENT IMPLEMENTATION */}
        <section className="py-24 border-t border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs text-blue-400 uppercase tracking-widest font-semibold mb-4">Current implementation</p>
              <h2 className="text-4xl sm:text-5xl font-serif text-white leading-tight">What SentinelPay actually runs today.</h2>
            </div>
            <div className="lg:col-span-7 lg:pl-12">
              <p className="text-slate-400 text-lg leading-relaxed text-balance">
                The live transaction path is deliberately narrower than the broader research direction. It is a tabular transaction-risk system. No microphone, speech sample, or conversation transcript is used by the current transaction-analysis endpoint.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden">
            {riskDomains.map(([number, title, description]) => (
              <article className="bg-[#0b0f16] p-8 flex flex-col sm:flex-row items-start gap-6" key={number}>
                <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 border border-white/10 rounded-md font-mono text-xs text-blue-400">
                  {number}
                </span>
                <div>
                  <h3 className="text-lg font-serif text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* RESEARCH BOUNDARY */}
        <section className="py-24 border-t border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs text-blue-400 uppercase tracking-widest font-semibold mb-4">Research boundary</p>
              <h2 className="text-4xl sm:text-5xl font-serif text-white leading-tight">Speech data is future-facing, not live fraud evidence.</h2>
            </div>
            <div className="lg:col-span-7 lg:pl-12">
              <p className="text-slate-400 text-lg leading-relaxed text-balance">
                TeleAntiFraud and ASVspoof 2021 DF were prepared as auxiliary research foundations. They are not treated as payment-fraud ground truth and do not contribute to the current transaction risk score.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden">
            <div className="lg:col-span-5 bg-[#0b0f16] p-10 lg:p-12">
              <h3 className="text-3xl font-serif text-white mb-6">Prediction is not certainty.</h3>
              <p className="text-slate-400 leading-relaxed">
                The model estimates risk from the information supplied to it. The policy determines the operational response, and the audit trail records what happened.
              </p>
            </div>
            <div className="lg:col-span-7 bg-[#0b0f16] p-10 lg:p-12">
              <div className="space-y-6">
                {[
                  "Structured transaction features are evaluated by the trained model.",
                  "The score is mapped to ALLOW, REVIEW, or BLOCK thresholds.",
                  "Supabase stores the session and resulting risk event.",
                  "Razorpay Test Mode is reached only through the payment-defense path.",
                ].map((item, index) => (
                  <div className="flex gap-6 pb-6 border-b border-white/5 last:border-0 last:pb-0" key={item}>
                    <span className="font-mono text-xs text-blue-400 mt-1">0{index + 1}</span>
                    <p className="text-slate-300 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-24 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10 bg-[radial-gradient(ellipse_at_top_right,rgba(96,165,250,0.05),transparent_50%)]">
          <h2 className="text-3xl sm:text-4xl font-serif text-white max-w-2xl leading-tight">
            Run a transaction through the SentinelPay decision pipeline.
          </h2>
          <Link 
            href={routes.dashboard}
            className="flex-shrink-0 inline-flex h-14 items-center justify-center gap-3 px-8 bg-blue-500 hover:bg-blue-400 text-slate-950 text-sm font-bold rounded-md shadow-[0_0_20px_rgba(96,165,250,0.2)] transition-all hover:-translate-y-0.5"
          >
            Open the console
            <Icon name="arrow-right" width={16} height={16} />
          </Link>
        </section>

      </main>
    </MarketingLayout>
  );
}