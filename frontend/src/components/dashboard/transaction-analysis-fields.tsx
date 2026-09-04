import type { TransactionAnalysisRequest } from "@/lib/types/risk";

export type NumberField = Exclude<
  keyof TransactionAnalysisRequest,
  "is_new_recipient"
>;

export interface FieldDefinition {
  key: NumberField;
  label: string;
  help: string;
  min: number;
  max?: number;
  step?: number;
}

export const defaultRequest: TransactionAnalysisRequest = {
  amount: 48500,
  hour: 12,
  day_of_week: 1,
  customer_prior_count: 24,
  customer_prior_mean: 8200,
  customer_prior_std: 1900,
  customer_time_since_previous_sec: 7200,
  terminal_prior_count: 280,
  customer_terminal_prior_count: 0,
  TX_TIME_SECONDS: 43200,
  TX_TIME_DAYS: 1,
  is_new_recipient: true,
};

export const transactionPresets: Array<{
  label: string;
  description: string;
  request: TransactionAnalysisRequest;
}> = [
  {
    label: "New recipient",
    description: "High-value payment with no recipient history.",
    request: defaultRequest,
  },
  {
    label: "Established pattern",
    description: "Amount and recipient activity near the customer baseline.",
    request: {
      ...defaultRequest,
      amount: 3400,
      customer_prior_count: 48,
      customer_prior_mean: 3900,
      customer_prior_std: 850,
      customer_terminal_prior_count: 8,
      is_new_recipient: false,
    },
  },
  {
    label: "High velocity",
    description: "Repeated recent transactions at the same terminal.",
    request: {
      ...defaultRequest,
      amount: 18500,
      customer_prior_count: 17,
      customer_prior_mean: 6100,
      customer_prior_std: 1400,
      customer_time_since_previous_sec: 90,
      customer_terminal_prior_count: 6,
      is_new_recipient: true,
    },
  },
];

export const transactionFields: FieldDefinition[] = [
  {
    key: "amount",
    label: "Amount (₹)",
    help: "Payment amount in rupees.",
    min: 0.01,
    step: 0.01,
  },
  {
    key: "hour",
    label: "Hour",
    help: "Transaction hour from 0 to 23.",
    min: 0,
    max: 23,
  },
  {
    key: "day_of_week",
    label: "Day of week",
    help: "0 is Monday; 6 is Sunday.",
    min: 0,
    max: 6,
  },
  {
    key: "TX_TIME_SECONDS",
    label: "TX time seconds",
    help: "Dataset-relative transaction time in seconds.",
    min: 0,
    step: 0.01,
  },
  {
    key: "TX_TIME_DAYS",
    label: "TX time days",
    help: "Dataset-relative transaction time in days.",
    min: 0,
    step: 0.01,
  },
];

export const historyFields: FieldDefinition[] = [
  {
    key: "customer_prior_count",
    label: "Customer prior count",
    help: "Known earlier customer transactions.",
    min: 0,
  },
  {
    key: "customer_prior_mean",
    label: "Customer prior mean (₹)",
    help: "Historical average transaction amount.",
    min: 0,
    step: 0.01,
  },
  {
    key: "customer_prior_std",
    label: "Customer prior std. dev.",
    help: "Historical amount standard deviation.",
    min: 0,
    step: 0.01,
  },
  {
    key: "customer_time_since_previous_sec",
    label: "Seconds since previous",
    help: "Elapsed time since the prior transaction.",
    min: 0,
    step: 0.01,
  },
  {
    key: "terminal_prior_count",
    label: "Terminal prior count",
    help: "Known earlier transactions at this terminal.",
    min: 0,
  },
  {
    key: "customer_terminal_prior_count",
    label: "Customer-terminal count",
    help: "Earlier transactions by this customer at this terminal.",
    min: 0,
  },
];

const integerFields = new Set<NumberField>([
  "hour",
  "day_of_week",
  "customer_prior_count",
  "terminal_prior_count",
  "customer_terminal_prior_count",
]);

export function validateRequest(request: TransactionAnalysisRequest) {
  const errors: Partial<Record<NumberField, string>> = {};

  for (const field of [...transactionFields, ...historyFields]) {
    const value = request[field.key];
    if (!Number.isFinite(value)) {
      errors[field.key] = "Enter a valid number.";
    } else if (value < field.min) {
      errors[field.key] = `Enter ${field.min} or more.`;
    } else if (field.max !== undefined && value > field.max) {
      errors[field.key] = `Enter ${field.max} or less.`;
    } else if (integerFields.has(field.key) && !Number.isInteger(value)) {
      errors[field.key] = "Enter a whole number.";
    }
  }

  return errors;
}

export function TransactionField({
  definition,
  value,
  error,
  onChange,
}: {
  definition: FieldDefinition;
  value: number;
  error?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={definition.key}>{definition.label}</label>
      <input
        id={definition.key}
        name={definition.key}
        type="number"
        inputMode="decimal"
        min={definition.min}
        max={definition.max}
        step={definition.step ?? 1}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={`${definition.key}-help`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span
        className={error ? "field-error" : "field-help"}
        id={`${definition.key}-help`}
      >
        {error ?? definition.help}
      </span>
    </div>
  );
}
