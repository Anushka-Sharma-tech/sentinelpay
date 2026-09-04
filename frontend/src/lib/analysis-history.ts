import { parseAnalysisResult } from "@/lib/api/analysis";
import { isRecord } from "@/lib/api/client";
import type {
  StoredAnalysis,
  TransactionAnalysisRequest,
} from "@/lib/types/risk";

const storageKey = "sentinelpay-recent-analyses";
const historyLimit = 5;
const historyEvent = "sentinelpay-analysis-saved";

function parseRequest(value: unknown): TransactionAnalysisRequest | null {
  if (
    !isRecord(value) ||
    typeof value.amount !== "number" ||
    typeof value.hour !== "number" ||
    typeof value.day_of_week !== "number" ||
    typeof value.customer_prior_count !== "number" ||
    typeof value.customer_prior_mean !== "number" ||
    typeof value.customer_prior_std !== "number" ||
    typeof value.customer_time_since_previous_sec !== "number" ||
    typeof value.terminal_prior_count !== "number" ||
    typeof value.customer_terminal_prior_count !== "number" ||
    typeof value.TX_TIME_SECONDS !== "number" ||
    typeof value.TX_TIME_DAYS !== "number" ||
    typeof value.is_new_recipient !== "boolean"
  ) {
    return null;
  }

  return {
    amount: value.amount,
    hour: value.hour,
    day_of_week: value.day_of_week,
    customer_prior_count: value.customer_prior_count,
    customer_prior_mean: value.customer_prior_mean,
    customer_prior_std: value.customer_prior_std,
    customer_time_since_previous_sec: value.customer_time_since_previous_sec,
    terminal_prior_count: value.terminal_prior_count,
    customer_terminal_prior_count: value.customer_terminal_prior_count,
    TX_TIME_SECONDS: value.TX_TIME_SECONDS,
    TX_TIME_DAYS: value.TX_TIME_DAYS,
    is_new_recipient: value.is_new_recipient,
  };
}

export function readAnalysisHistory(): StoredAnalysis[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      if (
        !isRecord(item) ||
        typeof item.submittedAt !== "string" ||
        !item.request
      ) {
        return [];
      }

      const request = parseRequest(item.request);
      if (!request) return [];

      try {
        return [
          {
            request,
            result: parseAnalysisResult(item.result),
            submittedAt: item.submittedAt,
          },
        ];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

export function getAnalysisHistorySnapshot() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(storageKey) ?? "";
}

export function subscribeToAnalysisHistory(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(historyEvent, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(historyEvent, onChange);
  };
}

export function saveAnalysis(
  request: TransactionAnalysisRequest,
  result: StoredAnalysis["result"],
) {
  const history = readAnalysisHistory().filter(
    (item) => item.result.event_id !== result.event_id,
  );
  const nextHistory: StoredAnalysis[] = [
    { request, result, submittedAt: new Date().toISOString() },
    ...history,
  ].slice(0, historyLimit);

  window.localStorage.setItem(storageKey, JSON.stringify(nextHistory));
  window.dispatchEvent(new Event(historyEvent));
}
