import joblib
import numpy as np
import pandas as pd
from pathlib import Path

ROOT = Path.cwd()

MODEL_FILE = ROOT / "models" / "sentinelpay_risk_v1.pkl"
DATA_DIR = ROOT / "data" / "processed" / "training"

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

def prepare(df):
    X = df[FEATURES].copy()
    X = X.replace([np.inf, -np.inf], np.nan)

    for column in X.columns:
        median = X[column].median()
        if pd.isna(median):
            median = 0.0
        X[column] = X[column].fillna(median)

    return X

model = joblib.load(MODEL_FILE)

for split_name in ["validation", "test"]:
    print()
    print("=" * 70)
    print(split_name.upper())
    print("=" * 70)

    df = pd.read_parquet(DATA_DIR / f"{split_name}.parquet")
    X = prepare(df)

    probabilities = model.predict_proba(X)[:, 1]

    medium = probabilities[(probabilities >= 0.25) & (probabilities < 0.60)]

    print("Total samples:", len(probabilities))
    print("Minimum score:", probabilities.min())
    print("Maximum score:", probabilities.max())
    print("Unique scores:", len(np.unique(probabilities)))

    print()
    print("LOW   (<0.25):", int((probabilities < 0.25).sum()))
    print("MEDIUM (0.25-<0.60):", len(medium))
    print("HIGH  (>=0.60):", int((probabilities >= 0.60).sum()))

    print()
    if len(medium):
        print("MEDIUM SCORE EXAMPLES:")
        unique_medium = np.unique(medium)

        for score in unique_medium[:20]:
            print(f"{score:.12f}")

        print()
        print("First 10 MEDIUM rows:")

        medium_indices = np.where(
            (probabilities >= 0.25)
            & (probabilities < 0.60)
        )[0][:10]

        for index in medium_indices:
            print(
                f"row={index}, "
                f"score={probabilities[index]:.12f}, "
                f"amount={df.iloc[index]['amount']}, "
                f"fraud={df.iloc[index]['TX_FRAUD']}"
            )
    else:
        print("NO MEDIUM-SCORE SAMPLES FOUND.")
