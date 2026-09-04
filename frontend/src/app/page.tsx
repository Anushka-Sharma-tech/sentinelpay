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
    "Voice and speech",
    "Checks whether speech is present, then extracts acoustic, prosodic, and speaker-consistency signals.",
  ],
  [
    "02",
    "Conversation context",
    "Looks for social-engineering patterns such as urgency, impersonation, OTP requests, and remote access.",
  ],
  [
    "03",
    "Transaction intelligence",
    "Considers amount deviation, new recipients, and recent transaction frequency.",
  ],
  [
    "04",
    "Behavioural signals",
    "Accounts for retries, failed attempts, and activity compressed into a short time window.",
  ],
  [
    "05",
    "Risk fusion",
    "Combines bounded signal scores so no single model is presented as unquestionable truth.",
  ],
  [
    "06",
    "Decision policy",
    "Maps the current transaction score to allow, review, or block.",
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
              Voice-assisted fraud leaves <em>more than one signal.</em>
            </h1>
            <p>
              SentinelPay brings speech, conversation, transaction, and
              behavioural evidence into one explainable risk decision—so an
              analyst can understand what was flagged and what to do next.
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
          <div className="hero-proof" aria-label="Example explainable risk event">
            <div className="proof-topline">
              <Status level="DEMO">Demonstration event</Status>
              <span className="mono">RE-E8A3F</span>
            </div>
            <div className="proof-decision">
              <RiskScore score={91} level="HIGH" />
              <div>
                <Status level="HIGH" />
                <h2>Urgent payment request</h2>
                <p>
                  Recommended action: block and verify the payment through a
                  trusted channel.
                </p>
              </div>
            </div>
            <div className="proof-signals">
              {[
                ["Conversation context", 94],
                ["Transaction intelligence", 88],
                ["Behavioural signals", 72],
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
              <p className="eyebrow">Why it matters</p>
              <h2>Fraud can look like a legitimate payment.</h2>
            </div>
            <div>
              <p>
                In social-engineering fraud, the account holder may authorise
                the transfer while acting under pressure, deception, or
                impersonation. Payment data alone can miss the conversation
                shaping that decision.
              </p>
            </div>
          </div>
          <div className="problem-points">
            <div className="problem-point">
              <span>01 / MANIPULATION</span>
              <h3>The victim may still approve</h3>
              <p>
                Conventional controls can see a valid user and valid
                credentials while missing coercion occurring over voice.
              </p>
            </div>
            <div className="problem-point">
              <span>02 / CONTEXT</span>
              <h3>Signals are distributed</h3>
              <p>
                Urgent language, caller claims, new-recipient risk, and unusual
                retries become more useful when considered together.
              </p>
            </div>
            <div className="problem-point">
              <span>03 / DECISION</span>
              <h3>A score is not an explanation</h3>
              <p>
                Reviewers need the contributing evidence, unavailable context,
                and a bounded action—not an opaque number.
              </p>
            </div>
          </div>
        </section>

        <section className="section-rule">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Multimodal assessment</p>
              <h2>How SentinelPay thinks about risk.</h2>
            </div>
            <div>
              <p>
                The product direction spans six conceptual areas. The mounted
                API currently scores transaction and historical activity;
                unavailable voice signals are returned neutrally.
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
              <p className="eyebrow">Explainability by design</p>
              <h2>Review the evidence behind a decision.</h2>
            </div>
            <div>
              <p>
                SentinelPay separates what the pipeline observed, what action
                it recommends, and what it could not verify. That distinction is
                essential for defensive, human-reviewed use.
              </p>
            </div>
          </div>
          <div className="explainability-panel">
            <div className="explainability-copy">
              <h3>Critical risk does not mean certain fraud.</h3>
              <p>
                It means the available signals crossed a policy threshold and
                need a proportionate response. Analysts retain context and
                control.
              </p>
            </div>
            <div className="explainability-list">
              {[
                "Why the session was flagged in plain language.",
                "Which signal families contributed most to the score.",
                "Which evidence was unavailable or uncertain.",
                "Which bounded action the decision policy recommends.",
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
          <h2>See the full analyst workflow in the demonstration console.</h2>
          <Link className="button" href={routes.dashboard}>
            Explore the console
            <Icon name="arrow-right" width={16} height={16} />
          </Link>
        </section>
      </div>
    </MarketingLayout>
  );
}
