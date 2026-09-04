export interface AnalyticsSnapshot {
  source: "demonstration";
  weeklyActivity: Array<{ label: string; events: number; escalations: number }>;
  riskDistribution: Array<{ label: string; value: number }>;
}

export interface ModelEvaluation {
  precision: null;
  recall: null;
  falsePositiveCost: null;
}
