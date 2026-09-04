import type { RiskLevel } from "@/lib/types/risk";

export function RiskScore({
  score,
  level,
  compact = false,
}: {
  score: number;
  level: RiskLevel;
  compact?: boolean;
}) {
  return (
    <div
      className={`risk-score risk-score-${level.toLowerCase()} ${
        compact ? "risk-score-compact" : ""
      }`}
      aria-label={`Risk score ${score} out of 100, ${level.toLowerCase()} risk`}
    >
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="risk-score-track" cx="60" cy="60" r="52" />
        <circle
          className="risk-score-value"
          cx="60"
          cy="60"
          r="52"
          pathLength="100"
          strokeDasharray={`${score} 100`}
        />
      </svg>
      <div>
        <strong>{score}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}
