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
      <div className="marketing-page">
        <section className="marketing-hero">
          <div className="marketing-hero-copy">
            <p className="eyebrow">Defensive payment-risk intelligence</p>
            <h1>
              Detect transaction risk before <em>payment creation.</em>
            </h1>
            <p>
              SentinelPay evaluates transaction and historical context with a
              trained machine-learning model, explains the available evidence,
              persists the decision, and applies an explicit payment-defense policy.
            </p>
            <div className="hero-actions">
              <Link className="button" href={routes.dashboard}>
                Explore the console
                <Icon name="arrow-right" width={16} height={16} />
              </Link>
              <Link className="button button-secondary" href={routes.howItWorks}>
                See how it works
              </Link>
            </div>
          </div>
          <div className="hero-proof" aria-label="Example transaction risk decision">
            <div className="proof-topline">
              <Status level="DEMO">Demonstration decision</Status>
              <span className="mono">MODEL V1</span>
            </div>
            <div className="proof-decision">
              <RiskScore score={91} level="HIGH" />
              <div>
                <Status level="HIGH" />
                <h2>High transaction risk</h2>
                <p>
                  Recommended action: block payment creation and require review.
                </p>
              </div>
            </div>
            <div className="proof-signals">
              {[
                ["Transaction intelligence", 88],
                ["Customer / terminal history", 81],
                ["Decision policy", 91],
              ].map(([label, value]) => (
                <div className="proof-signal" key={label}>
                  <span>{label}</span>
                  <span className="proof-signal-track">
                    <span style={{ width: `${value}%` }} />
                  </span>
                  <span className="mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-rule">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The problem</p>
              <h2>A valid payment can still be risky.</h2>
            </div>
            <div>
              <p>
                Payment fraud creates an asymmetric decision problem. Blocking
                legitimate payments creates friction, while allowing fraudulent
                transactions can expose the merchant to financial loss. SentinelPay
                turns available transaction context into a measurable risk score and
                a bounded operational action.
              </p>
            </div>
          </div>
          <div className="problem-points">
            <div className="problem-point">
              <span>01 / DETECT</span>
              <h3>Estimate transaction risk</h3>
              <p>
                Use transaction amount, timing, customer history, terminal activity,
                and related behavioral context as structured model inputs.
              </p>
            </div>
            <div className="problem-point">
              <span>02 / EXPLAIN</span>
              <h3>Make the result inspectable</h3>
              <p>
                Surface the factors that can be derived from the supplied input
                instead of presenting an unexplained probability.
              </p>
            </div>
            <div className="problem-point">
              <span>03 / DEFEND</span>
              <h3>Gate payment creation</h3>
              <p>
                A risk prediction becomes useful only when it is connected to an
                explicit policy and a downstream payment control.
              </p>
            </div>
          </div>
        </section>

        <section className="section-rule">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Current implementation</p>
              <h2>What SentinelPay actually runs today.</h2>
            </div>
            <div>
              <p>
                The live transaction path is deliberately narrower than the broader
                research direction. It is a tabular transaction-risk system. No
                microphone, speech sample, or conversation transcript is used by
                the current transaction-analysis endpoint.
              </p>
            </div>
          </div>
          <div className="risk-domains">
            {riskDomains.map(([number, title, description]) => (
              <article className="risk-domain" key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-rule">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Research boundary</p>
              <h2>Speech data is future-facing, not live fraud evidence.</h2>
            </div>
            <div>
              <p>
                TeleAntiFraud and ASVspoof 2021 DF were prepared as auxiliary
                research foundations. They are not treated as payment-fraud ground
                truth and do not contribute to the current transaction risk score.
              </p>
            </div>
          </div>
          <div className="explainability-panel">
            <div className="explainability-copy">
              <h3>Prediction is not certainty.</h3>
              <p>
                The model estimates risk from the information supplied to it. The
                policy determines the operational response, and the audit trail
                records what happened.
              </p>
            </div>
            <div className="explainability-list">
              {[
                "Structured transaction features are evaluated by the trained model.",
                "The score is mapped to ALLOW, REVIEW, or BLOCK thresholds.",
                "Supabase stores the session and resulting risk event.",
                "Razorpay Test Mode is reached only through the payment-defense path.",
              ].map((item, index) => (
                <div key={item}>
                  <span>0{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band">
          <h2>Run a transaction through the SentinelPay decision pipeline.</h2>
          <Link className="button" href={routes.dashboard}>
            Open the console
            <Icon name="arrow-right" width={16} height={16} />
          </Link>
        </section>
      </div>
    </MarketingLayout>
  );
}
