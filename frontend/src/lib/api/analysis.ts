import { ApiError, isRecord, postJson } from "@/lib/api/client";

import type {
  AnalysisResult,
  RiskFactor,
  RiskLevel,
  RiskDecision,
  SignalKey,
  TransactionAnalysisRequest,
} from "@/lib/types/risk";

const signalKeys: SignalKey[] = [
  "acoustic",
  "prosody",
  "speaker",
  "context",
  "transaction",
  "behaviour",
];

function isRiskLevel(value: unknown): value is RiskLevel {
  return value === "LOW" || value === "MEDIUM" || value === "HIGH";
}

function isRiskDecision(value: unknown): value is RiskDecision {
  return value === "ALLOW" || value === "REVIEW" || value === "BLOCK";
}

function isUnitInterval(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
}

function parseFactor(value: unknown): RiskFactor | null {
  if (
    !isRecord(value) ||
    typeof value.name !== "string" ||
    value.name.length === 0 ||
    typeof value.category !== "string" ||
    value.category.length === 0 ||
    !isUnitInterval(value.contribution) ||
    typeof value.evidence !== "string" ||
    value.evidence.length === 0
  ) {
    return null;
  }

  return {
    name: value.name,
    category: value.category,
    contribution: value.contribution,
    evidence: value.evidence,
  };
}

export function parseAnalysisResult(value: unknown): AnalysisResult {
  if (
    !isRecord(value) ||
    !isUnitInterval(value.risk_score) ||
    !isRiskLevel(value.risk_level) ||
    !isRiskDecision(value.decision) ||
    !isRecord(value.signals) ||
    !Array.isArray(value.factors) ||
    typeof value.model_version !== "string" ||
    value.model_version.length === 0 ||
    typeof value.calibrated !== "boolean" ||
    typeof value.latency_ms !== "number" ||
    !Number.isFinite(value.latency_ms) ||
    value.latency_ms < 0 ||
    typeof value.event_id !== "string" ||
    value.event_id.length === 0 ||
    typeof value.session_id !== "string" ||
    value.session_id.length === 0
  ) {
    throw new ApiError(
      "The backend returned a malformed risk-analysis response.",
      200,
    );
  }

  const signals = {} as Record<SignalKey, number>;

  for (const key of signalKeys) {
    const score = value.signals[key];

    if (!isUnitInterval(score)) {
      throw new ApiError(
        "The backend returned malformed signal scores.",
        200,
      );
    }

    signals[key] = score;
  }

  const factors = value.factors.map(parseFactor);

  if (factors.some((factor) => factor === null)) {
    throw new ApiError(
      "The backend returned malformed risk factors.",
      200,
    );
  }

  return {
    risk_score: value.risk_score,
    risk_level: value.risk_level,
    decision: value.decision,
    signals,
    factors: factors.filter(
      (factor): factor is RiskFactor => factor !== null,
    ),
    model_version: value.model_version,
    calibrated: value.calibrated,
    latency_ms: value.latency_ms,
    event_id: value.event_id,
    session_id: value.session_id,
  };
}

export async function analyzeTransaction(
  request: TransactionAnalysisRequest,
) {
  const payload = await postJson("/api/v1/analyze", request);

  return parseAnalysisResult(payload);
}