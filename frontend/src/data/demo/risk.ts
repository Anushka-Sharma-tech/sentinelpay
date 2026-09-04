import type { Investigation, RiskEvent } from "@/lib/types/risk";

export const demoRiskEvents: RiskEvent[] = [
  {
    id: "RE-E8A3F",
    sessionId: "SE-4F82",
    investigationId: "IN-204",
    title: "Urgent payment request",
    summary:
      "The conversation combined urgency, bank impersonation language, and a payment request to a new recipient.",
    riskScore: 91,
    riskLevel: "HIGH",
    decision: "BLOCK",
    occurredAt: "Today, 10:42",
    amount: "₹48,500",
    signals: [
      {
        key: "context",
        label: "Conversation context",
        score: 0.94,
        summary: "Urgency, bank impersonation, and payment language detected.",
      },
      {
        key: "transaction",
        label: "Transaction intelligence",
        score: 0.88,
        summary: "New recipient and amount materially above the usual pattern.",
      },
      {
        key: "behaviour",
        label: "Behavioural signals",
        score: 0.72,
        summary: "Repeated attempts occurred within a short period.",
      },
      {
        key: "acoustic",
        label: "Acoustic analysis",
        score: 0.61,
        summary: "The audio classifier returned an elevated acoustic signal.",
        limitation: "This model has not been evaluated as a deepfake detector.",
      },
      {
        key: "prosody",
        label: "Prosody",
        score: 0.54,
        summary: "Speech rhythm and pitch variation were atypical.",
      },
      {
        key: "speaker",
        label: "Speaker consistency",
        score: null,
        summary: "No trusted speaker baseline was available for comparison.",
      },
    ],
    explanations: [
      "The caller used urgent language while requesting a payment.",
      "The request involved a new recipient and an unusually high amount.",
      "No trusted speaker baseline was available, so identity consistency is uncertain.",
    ],
    unavailableEvidence: [
      "Trusted speaker baseline",
      "Production payment history",
      "Measured model calibration",
    ],
    modelVersion: "baseline-v1",
  },
  {
    id: "RE-72C1A",
    sessionId: "SE-9D10",
    investigationId: "IN-205",
    title: "Possible bank impersonation",
    summary:
      "A caller claimed to represent a bank security team and requested a verification code.",
    riskScore: 78,
    riskLevel: "HIGH",
    decision: "BLOCK",
    occurredAt: "Today, 09:18",
    amount: "₹12,000",
    signals: [
      {
        key: "context",
        label: "Conversation context",
        score: 0.87,
        summary: "Bank impersonation and verification-code language detected.",
      },
      {
        key: "transaction",
        label: "Transaction intelligence",
        score: 0.46,
        summary: "The amount is within the demonstration account's normal range.",
      },
      {
        key: "behaviour",
        label: "Behavioural signals",
        score: 0.58,
        summary: "Two recent retries increased the behavioural signal.",
      },
      {
        key: "acoustic",
        label: "Acoustic analysis",
        score: 0.43,
        summary: "No dominant acoustic anomaly was identified.",
      },
      {
        key: "prosody",
        label: "Prosody",
        score: 0.65,
        summary: "Pressure and interruption patterns were elevated.",
      },
      {
        key: "speaker",
        label: "Speaker consistency",
        score: null,
        summary: "No trusted speaker baseline was available for comparison.",
      },
    ],
    explanations: [
      "The caller claimed to be from a bank security department.",
      "The conversation requested a one-time verification code.",
    ],
    unavailableEvidence: ["Trusted speaker baseline", "Verified caller identity"],
    modelVersion: "baseline-v1",
  },
  {
    id: "RE-31B7D",
    sessionId: "SE-7A24",
    title: "New recipient payment",
    summary:
      "A new recipient was added, but the conversation contained no strong manipulation indicators.",
    riskScore: 51,
    riskLevel: "MEDIUM",
    decision: "REVIEW",
    occurredAt: "Yesterday, 18:06",
    amount: "₹6,750",
    signals: [
      {
        key: "transaction",
        label: "Transaction intelligence",
        score: 0.7,
        summary: "The recipient is new for this demonstration account.",
      },
      {
        key: "context",
        label: "Conversation context",
        score: 0.28,
        summary: "No strong impersonation or urgency language was detected.",
      },
      {
        key: "behaviour",
        label: "Behavioural signals",
        score: 0.35,
        summary: "A single retry contributed limited risk.",
      },
      {
        key: "acoustic",
        label: "Acoustic analysis",
        score: 0.31,
        summary: "The acoustic signal was low in this demonstration.",
      },
      {
        key: "prosody",
        label: "Prosody",
        score: 0.39,
        summary: "Speech variation remained within the demonstration baseline.",
      },
      {
        key: "speaker",
        label: "Speaker consistency",
        score: null,
        summary: "No trusted speaker baseline was available for comparison.",
      },
    ],
    explanations: [
      "The payment is going to a new recipient.",
      "Step-up verification is recommended before continuing.",
    ],
    unavailableEvidence: ["Trusted speaker baseline"],
    modelVersion: "baseline-v1",
  },
];

export const demoInvestigations: Investigation[] = [
  {
    id: "IN-204",
    title: "Urgent payment request",
    riskLevel: "HIGH",
    status: "Open",
    recommendedAction: "Block",
    lastActivity: "10 minutes ago",
    eventIds: ["RE-E8A3F"],
    summary:
      "Review whether social pressure and transaction anomalies indicate an attempted authorised-push-payment scam.",
    timeline: [
      {
        time: "10:42",
        title: "Risk event created",
        detail: "The score crossed the block threshold.",
      },
      {
        time: "10:42",
        title: "Evidence assembled",
        detail: "Context, transaction, behaviour, and audio signals were recorded.",
      },
      {
        time: "10:45",
        title: "Investigation opened",
        detail: "Awaiting analyst review in the demonstration console.",
      },
    ],
  },
  {
    id: "IN-205",
    title: "Possible bank impersonation",
    riskLevel: "HIGH",
    status: "Reviewing",
    recommendedAction: "Block",
    lastActivity: "1 hour ago",
    eventIds: ["RE-72C1A"],
    summary:
      "Validate the caller's claimed identity and review the verification-code request.",
    timeline: [
      {
        time: "09:18",
        title: "Risk event created",
        detail: "Bank impersonation language contributed to a high-risk decision.",
      },
      {
        time: "09:26",
        title: "Review started",
        detail: "The investigation status was moved to reviewing.",
      },
    ],
  },
];
