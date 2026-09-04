import type {
  AnalyticsSnapshot,
  ModelEvaluation,
} from "@/lib/types/analytics";

export const demoAnalytics: AnalyticsSnapshot = {
  source: "demonstration",
  weeklyActivity: [
    { label: "M", events: 44, escalations: 8 },
    { label: "T", events: 62, escalations: 14 },
    { label: "W", events: 38, escalations: 6 },
    { label: "T", events: 76, escalations: 20 },
    { label: "F", events: 58, escalations: 12 },
    { label: "S", events: 84, escalations: 28 },
    { label: "S", events: 67, escalations: 16 },
  ],
  riskDistribution: [
    { label: "Critical", value: 18 },
    { label: "High", value: 31 },
    { label: "Medium", value: 37 },
    { label: "Low", value: 14 },
  ],
};

export const currentModelEvaluation: ModelEvaluation = {
  precision: null,
  recall: null,
  falsePositiveCost: null,
};
