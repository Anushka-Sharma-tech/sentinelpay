export interface AnalyticsSnapshot {
  source: "demonstration";
  weeklyActivity: Array<{ label: string; events: number; reviews: number }>;
  riskDistribution: Array<{ label: string; value: number }>;
}

export interface ModelEvaluation {
  precision: string;
  recall: string;
  falsePositiveCost: string;
}
