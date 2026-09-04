export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RiskDecision =
  | "ALLOW"
  | "STEP_UP_VERIFICATION"
  | "MANUAL_REVIEW"
  | "ESCALATE";

export type SignalKey =
  | "acoustic"
  | "prosody"
  | "speaker"
  | "context"
  | "behaviour"
  | "transaction";

export interface RiskSignal {
  key: SignalKey;
  label: string;
  score: number | null;
  summary: string;
  limitation?: string;
}

export interface RiskEvent {
  id: string;
  sessionId: string;
  investigationId?: string;
  title: string;
  summary: string;
  riskScore: number;
  riskLevel: RiskLevel;
  decision: RiskDecision;
  occurredAt: string;
  amount?: string;
  signals: RiskSignal[];
  explanations: string[];
  unavailableEvidence: string[];
  modelVersion: string;
}

export interface Investigation {
  id: string;
  title: string;
  riskLevel: RiskLevel;
  status: "Open" | "Reviewing" | "Resolved";
  recommendedAction: string;
  lastActivity: string;
  eventIds: string[];
  summary: string;
  timeline: Array<{ time: string; title: string; detail: string }>;
}

export interface AnalysisResult {
  risk_score: number;
  risk_level: RiskLevel;
  decision: RiskDecision;
  signals: Record<SignalKey, number>;
  explanations: string[];
  model_version: string;
  latency_ms: number;
}
