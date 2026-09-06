import joblib
import numpy as np
import pandas as pd
from pathlib import Path

ROOT = Path.cwd()

MODEL_FILE = ROOT / "models" / "sentinelpay_risk_v1.pkl"

FEATURES = [
    "amount",
    "hour",
    "day_of_week",
    "hour_sin",
    "hour_cos",
    "customer_prior_count",
    "customer_prior_mean",
    "customer_prior_std",
    "customer_time_since_previous_sec",
    "amount_vs_customer_mean",
    "amount_zscore",
    "terminal_prior_count",
    "customer_terminal_prior_count",
    "TX_TIME_SECONDS",
    "TX_TIME_DAYS",
]

request = {
    "amount": 221.26,
    "hour": 14,
    "day_of_week": 0,
    "customer_prior_count": 397,
    "customer_prior_mean": 91.08226012793178,
    "customer_prior_std": 39.66400072392994,
    "customer_time_since_previous_sec": 9290.0,
    "terminal_prior_count": 126,
    "customer_terminal_prior_count": 3,
    "TX_TIME_SECONDS": 13442531,
    "TX_TIME_DAYS": 155,
}

features = {
    "amount": request["amount"],
    "hour": request["hour"],
    "day_of_week": request["day_of_week"],
    "hour_sin": np.sin(2 * np.pi * request["hour"] / 24),
    "hour_cos": np.cos(2 * np.pi * request["hour"] / 24),
    "customer_prior_count": request["customer_prior_count"],
    "customer_prior_mean": request["customer_prior_mean"],
    "customer_prior_std": request["customer_prior_std"],
    "customer_time_since_previous_sec": request["customer_time_since_previous_sec"],
    "amount_vs_customer_mean": (
        request["amount"] / request["customer_prior_mean"]
        if request["customer_prior_mean"] > 0
        else 0.0
    ),
    "amount_zscore": (
        (request["amount"] - request["customer_prior_mean"])
        / request["customer_prior_std"]
        if request["customer_prior_std"] > 0
        else 0.0
    ),
    "terminal_prior_count": request["terminal_prior_count"],
    "customer_terminal_prior_count": request["customer_terminal_prior_count"],
    "TX_TIME_SECONDS": request["TX_TIME_SECONDS"],
    "TX_TIME_DAYS": request["TX_TIME_DAYS"],
}

X = pd.DataFrame([features])[FEATURES]

model = joblib.load(MODEL_FILE)

score = float(model.predict_proba(X)[0, 1])

print("=" * 70)
print("LOCAL API-STYLE REPRODUCTION")
print("=" * 70)
print(f"Risk score: {score:.12f}")

if score < 0.25:
    print("Risk level: LOW")
    print("Decision: ALLOW")
elif score < 0.60:
    print("Risk level: MEDIUM")
    print("Decision: REVIEW")
else:
    print("Risk level: HIGH")
    print("Decision: BLOCK")

print()
print("Derived features:")
print(f"hour_sin: {features['hour_sin']:.12f}")
print(f"hour_cos: {features['hour_cos']:.12f}")
print(f"amount_vs_customer_mean: {features['amount_vs_customer_mean']:.12f}")
print(f"amount_zscore: {features['amount_zscore']:.12f}")
