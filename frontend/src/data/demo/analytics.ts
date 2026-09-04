import type {
  AnalyticsSnapshot,
  ModelEvaluation,
} from "@/lib/types/analytics";

export const demoAnalytics: AnalyticsSnapshot = {
  source: "demonstration",
  weeklyActivity: [
    { label: "M", events: 44, reviews: 8 },
    { label: "T", events: 62, reviews: 14 },
    { label: "W", events: 38, reviews: 6 },
    { label: "T", events: 76, reviews: 20 },
    { label: "F", events: 58, reviews: 12 },
    { label: "S", events: 84, reviews: 28 },
    { label: "S", events: 67, reviews: 16 },
  ],
  riskDistribution: [
    { label: "High", value: 49 },
    { label: "Medium", value: 37 },
    { label: "Low", value: 14 },
  ],
};

export const currentModelEvaluation: ModelEvaluation = {
  precision: "87.01%",
  recall: "30.47%",
  falsePositiveCost: "₹5,300*",
};
