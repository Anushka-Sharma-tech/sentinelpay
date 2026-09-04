from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    average_precision_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.ensemble import HistGradientBoostingClassifier


ROOT = Path(__file__).resolve().parents[1]

DATA_DIR = ROOT / "data" / "processed" / "training"

MODEL_DIR = ROOT / "models"
MODEL_FILE = MODEL_DIR / "sentinelpay_risk_v1.pkl"
MANIFEST_FILE = MODEL_DIR / "manifests" / "sentinelpay-v1.json"


TARGET = "TX_FRAUD"

# Deliberately exclude identifiers, timestamps, and the target.
# Historical behavior features remain.
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


def load_split(name: str) -> pd.DataFrame:
    path = DATA_DIR / f"{name}.parquet"

    if not path.exists():
        raise FileNotFoundError(path)

    return pd.read_parquet(path)


def prepare_xy(df: pd.DataFrame):
    missing = [
        c for c in FEATURES + [TARGET]
        if c not in df.columns
    ]

    if missing:
        raise ValueError(
            f"Missing columns: {missing}"
        )

    X = df[FEATURES].copy()
    y = df[TARGET].astype(int)

    # Models cannot consume NaN.
    X = X.replace(
        [np.inf, -np.inf],
        np.nan,
    )

    # Median imputation using the current split is okay for this
    # baseline; importantly, no target information is used.
    for column in X.columns:
        median = X[column].median()

        if pd.isna(median):
            median = 0.0

        X[column] = X[column].fillna(median)

    return X, y


def main() -> None:
    print("=" * 70)
    print("SENTINELPAY RISK MODEL TRAINING")
    print("=" * 70)

    train = load_split("train")
    validation = load_split("validation")

    print()
    print("TRAIN:", train.shape)
    print("VALIDATION:", validation.shape)

    X_train, y_train = prepare_xy(train)
    X_val, y_val = prepare_xy(validation)

    print()
    print("Features:", len(FEATURES))
    print("Fraud in train:", int(y_train.sum()))
    print("Legitimate in train:", int((y_train == 0).sum()))

    model = HistGradientBoostingClassifier(
        learning_rate=0.08,
        max_iter=250,
        max_leaf_nodes=31,
        min_samples_leaf=50,
        l2_regularization=1.0,
        random_state=42,
    )

    print()
    print("Training model...")

    model.fit(X_train, y_train)

    validation_probability = model.predict_proba(
        X_val
    )[:, 1]

    validation_prediction = (
        validation_probability >= 0.50
    ).astype(int)

    metrics = {
        "precision": precision_score(
            y_val,
            validation_prediction,
            zero_division=0,
        ),
        "recall": recall_score(
            y_val,
            validation_prediction,
            zero_division=0,
        ),
        "f1": f1_score(
            y_val,
            validation_prediction,
            zero_division=0,
        ),
        "pr_auc": average_precision_score(
            y_val,
            validation_probability,
        ),
        "roc_auc": roc_auc_score(
            y_val,
            validation_probability,
        ),
    }

    print()
    print("=" * 70)
    print("VALIDATION RESULTS")
    print("=" * 70)

    for name, value in metrics.items():
        print(f"{name:12s}: {value:.6f}")

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    MANIFEST_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        model,
        MODEL_FILE,
    )

    manifest = {
        "model_name": "sentinelpay_risk",
        "version": "1.0.0",
        "model_type": "HistGradientBoostingClassifier",
        "features": FEATURES,
        "training_dataset": "sentinelpay-v1",
        "random_state": 42,
        "validation_metrics": metrics,
    }

    MANIFEST_FILE.write_text(
        json.dumps(
            manifest,
            indent=2,
        ),
        encoding="utf-8",
    )

    print()
    print("MODEL:", MODEL_FILE)
    print("MANIFEST:", MANIFEST_FILE)
    print()
    print("STATUS: SUCCESS")


if __name__ == "__main__":
    main()