export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type RiskDecision = "ALLOW" | "REVIEW" | "BLOCK";

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
  factors: RiskFactor[];
  model_version: string;
  calibrated: boolean;
  latency_ms: number;
  event_id: string;
  session_id: string;
}

export interface RiskFactor {
  name: string;
  category: string;
  contribution: number;
  evidence: string;
}

export interface TransactionAnalysisRequest {
  amount: number;
  hour: number;
  day_of_week: number;
  customer_prior_count: number;
  customer_prior_mean: number;
  customer_prior_std: number;
  customer_time_since_previous_sec: number;
  terminal_prior_count: number;
  customer_terminal_prior_count: number;
  TX_TIME_SECONDS: number;
  TX_TIME_DAYS: number;
  is_new_recipient: boolean;
}

export interface StoredAnalysis {
  request: TransactionAnalysisRequest;
  result: AnalysisResult;
  submittedAt: string;
}
