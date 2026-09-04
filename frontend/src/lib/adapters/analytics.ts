import {
  currentModelEvaluation,
  demoAnalytics,
} from "@/data/demo/analytics";

export async function getAnalyticsSnapshot() {
  return demoAnalytics;
}

export async function getModelEvaluation() {
  return currentModelEvaluation;
}
