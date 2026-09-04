from __future__ import annotations

import json
from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from sklearn.metrics import (
    average_precision_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)


ROOT = Path(__file__).resolve().parents[1]

DATA_DIR = ROOT / "data" / "processed" / "training"

MODEL_FILE = ROOT / "models" / "sentinelpay_risk_v1.pkl"

OUTPUT_DIR = ROOT / "evaluation"

METRICS_DIR = OUTPUT_DIR / "metrics"
REPORTS_DIR = OUTPUT_DIR / "reports"
PLOTS_DIR = OUTPUT_DIR / "plots"

METRICS_FILE = METRICS_DIR / "risk_model_metrics.json"
REPORT_FILE = REPORTS_DIR / "risk_model_report.md"
CONFUSION_FILE = PLOTS_DIR / "confusion_matrix.png"


TARGET = "TX_FRAUD"

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


# ---------------------------------------------------------
# Business-cost assumptions
# ---------------------------------------------------------
#
# FP cost represents an operational/business cost for wrongly
# flagging a legitimate transaction.
#
# FN cost uses the actual transaction amount as the loss exposure
# for a fraudulent transaction that was allowed through.
#
# These are explicit assumptions, not learned facts.
#
FALSE_POSITIVE_COST_RUPEES = 50.0


def load_data(name: str) -> pd.DataFrame:
    path = DATA_DIR / f"{name}.parquet"

    if not path.exists():
        raise FileNotFoundError(path)

    return pd.read_parquet(path)


def prepare_features(df: pd.DataFrame):
    missing = [
        column
        for column in FEATURES + [TARGET]
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            f"Missing columns: {missing}"
        )

    X = df[FEATURES].copy()
    y = df[TARGET].astype(int)

    X = X.replace(
        [np.inf, -np.inf],
        np.nan,
    )

    # Match the preprocessing used by the training script.
    for column in X.columns:
        median = X[column].median()

        if pd.isna(median):
            median = 0.0

        X[column] = X[column].fillna(median)

    return X, y


def calculate_cost(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    amounts: np.ndarray,
) -> dict[str, float]:
    fp_mask = (
        (y_true == 0)
        & (y_pred == 1)
    )

    fn_mask = (
        (y_true == 1)
        & (y_pred == 0)
    )

    fp_count = int(fp_mask.sum())
    fn_count = int(fn_mask.sum())

    fp_cost = (
        fp_count
        * FALSE_POSITIVE_COST_RUPEES
    )

    fn_exposure = float(
        amounts[fn_mask].sum()
    )

    expected_cost = (
        fp_cost
        + fn_exposure
    )

    return {
        "false_positive_count": fp_count,
        "false_negative_count": fn_count,
        "false_positive_cost_rupees": fp_cost,
        "false_negative_exposure_rupees": fn_exposure,
        "expected_cost_rupees": expected_cost,
    }


def find_best_threshold(
    y_true: np.ndarray,
    probabilities: np.ndarray,
    amounts: np.ndarray,
) -> tuple[float, dict]:
    """
    Select threshold ONLY on validation data.

    Objective:
        FP operational cost
        +
        FN transaction-loss exposure

    This threshold is then frozen before evaluating test data.
    """

    best_threshold = 0.50
    best_cost = float("inf")
    best_result = {}

    thresholds = np.arange(
        0.05,
        0.951,
        0.01,
    )

    for threshold in thresholds:
        predictions = (
            probabilities >= threshold
        ).astype(int)

        result = calculate_cost(
            y_true,
            predictions,
            amounts,
        )

        cost = result["expected_cost_rupees"]

        if cost < best_cost:
            best_cost = cost
            best_threshold = float(threshold)
            best_result = result

    return best_threshold, best_result


def evaluate(
    y_true: np.ndarray,
    probabilities: np.ndarray,
    amounts: np.ndarray,
    threshold: float,
) -> dict:
    predictions = (
        probabilities >= threshold
    ).astype(int)

    tn, fp, fn, tp = confusion_matrix(
        y_true,
        predictions,
        labels=[0, 1],
    ).ravel()

    precision = precision_score(
        y_true,
        predictions,
        zero_division=0,
    )

    recall = recall_score(
        y_true,
        predictions,
        zero_division=0,
    )

    f1 = f1_score(
        y_true,
        predictions,
        zero_division=0,
    )

    pr_auc = average_precision_score(
        y_true,
        probabilities,
    )

    roc_auc = roc_auc_score(
        y_true,
        probabilities,
    )

    total_legitimate = tn + fp
    total_fraud = tp + fn

    fpr = (
        fp / total_legitimate
        if total_legitimate
        else 0.0
    )

    fnr = (
        fn / total_fraud
        if total_fraud
        else 0.0
    )

    cost = calculate_cost(
        y_true,
        predictions,
        amounts,
    )

    return {
        "threshold": threshold,
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "pr_auc": float(pr_auc),
        "roc_auc": float(roc_auc),
        "true_negative": int(tn),
        "false_positive": int(fp),
        "false_negative": int(fn),
        "true_positive": int(tp),
        "fpr": float(fpr),
        "fnr": float(fnr),
        **cost,
    }


def save_confusion_matrix(
    y_true: np.ndarray,
    probabilities: np.ndarray,
    threshold: float,
) -> None:
    predictions = (
        probabilities >= threshold
    ).astype(int)

    matrix = confusion_matrix(
        y_true,
        predictions,
        labels=[0, 1],
    )

    fig, ax = plt.subplots(
        figsize=(6, 5)
    )

    image = ax.imshow(matrix)

    ax.set_title(
        "SentinelPay Risk Model — Test Set"
    )

    ax.set_xlabel(
        "Predicted"
    )

    ax.set_ylabel(
        "Actual"
    )

    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])

    ax.set_xticklabels(
        ["Legitimate", "Fraud"]
    )

    ax.set_yticklabels(
        ["Legitimate", "Fraud"]
    )

    for i in range(2):
        for j in range(2):
            ax.text(
                j,
                i,
                str(matrix[i, j]),
                ha="center",
                va="center",
            )

    fig.colorbar(image)

    fig.tight_layout()

    PLOTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    fig.savefig(
        CONFUSION_FILE,
        dpi=180,
    )

    plt.close(fig)


def write_report(
    threshold: float,
    validation_result: dict,
    test_result: dict,
    train_size: int,
    validation_size: int,
    test_size: int,
) -> None:

    REPORTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    report = f"""# SentinelPay Risk Model Evaluation

## Dataset

- Training samples: {train_size:,}
- Validation samples: {validation_size:,}
- Test samples: {test_size:,}
- Test set remained untouched during threshold selection.

## Operating threshold

Threshold selected using the validation set:

**{threshold:.2f}**

The objective was:

`false-positive cost + false-negative transaction-loss exposure`

### False-positive cost assumption

A false positive is assigned an operational cost of:

**₹{FALSE_POSITIVE_COST_RUPEES:.2f}**

A false negative uses the affected fraud transaction amount as loss exposure.

These are explicit evaluation assumptions and should not be presented as measured real-world merchant costs.

## Validation results at selected threshold

| Metric | Value |
|---|---:|
| Precision | {validation_result["precision"]:.4f} |
| Recall | {validation_result["recall"]:.4f} |
| F1 | {validation_result["f1"]:.4f} |
| PR-AUC | {validation_result["pr_auc"]:.4f} |
| ROC-AUC | {validation_result["roc_auc"]:.4f} |
| FPR | {validation_result["fpr"]:.4f} |
| FNR | {validation_result["fnr"]:.4f} |
| Expected cost | ₹{validation_result["expected_cost_rupees"]:,.2f} |

## Held-out test results

| Metric | Value |
|---|---:|
| Precision | {test_result["precision"]:.4f} |
| Recall | {test_result["recall"]:.4f} |
| F1 | {test_result["f1"]:.4f} |
| PR-AUC | {test_result["pr_auc"]:.4f} |
| ROC-AUC | {test_result["roc_auc"]:.4f} |
| FPR | {test_result["fpr"]:.4f} |
| FNR | {test_result["fnr"]:.4f} |
| True positives | {test_result["true_positive"]:,} |
| True negatives | {test_result["true_negative"]:,} |
| False positives | {test_result["false_positive"]:,} |
| False negatives | {test_result["false_negative"]:,} |
| False-positive cost | ₹{test_result["false_positive_cost_rupees"]:,.2f} |
| False-negative exposure | ₹{test_result["false_negative_exposure_rupees"]:,.2f} |
| Expected cost | ₹{test_result["expected_cost_rupees"]:,.2f} |

## Interpretation

The reported test metrics are from the held-out test set and were not used to select the operating threshold.

The false-positive cost is an explicit modeling assumption rather than a claim about actual merchant economics.

"""

    REPORT_FILE.write_text(
        report,
        encoding="utf-8",
    )


def main() -> None:
    print("=" * 70)
    print("SENTINELPAY HELD-OUT EVALUATION")
    print("=" * 70)

    if not MODEL_FILE.exists():
        raise FileNotFoundError(
            f"Model not found: {MODEL_FILE}"
        )

    train = load_data("train")
    validation = load_data("validation")
    test = load_data("test")

    print()
    print(
        "Train:",
        f"{len(train):,}",
    )

    print(
        "Validation:",
        f"{len(validation):,}",
    )

    print(
        "Test:",
        f"{len(test):,}",
    )

    model = joblib.load(
        MODEL_FILE
    )

    print()
    print("Preparing validation set...")

    X_val, y_val = prepare_features(
        validation
    )

    validation_probabilities = (
        model.predict_proba(X_val)[:, 1]
    )

    validation_amounts = (
        validation["amount"]
        .astype(float)
        .to_numpy()
    )

    print(
        "Selecting threshold using validation only..."
    )

    threshold, threshold_cost = find_best_threshold(
        y_val.to_numpy(),
        validation_probabilities,
        validation_amounts,
    )

    validation_result = evaluate(
        y_val.to_numpy(),
        validation_probabilities,
        validation_amounts,
        threshold,
    )

    print(
        f"Selected threshold: {threshold:.2f}"
    )

    print()
    print("Preparing TEST set...")

    X_test, y_test = prepare_features(
        test
    )

    test_probabilities = (
        model.predict_proba(X_test)[:, 1]
    )

    test_amounts = (
        test["amount"]
        .astype(float)
        .to_numpy()
    )

    print(
        "Evaluating untouched test set..."
    )

    test_result = evaluate(
        y_test.to_numpy(),
        test_probabilities,
        test_amounts,
        threshold,
    )

    print()
    print("=" * 70)
    print("HELD-OUT TEST RESULTS")
    print("=" * 70)

    for key in [
        "precision",
        "recall",
        "f1",
        "pr_auc",
        "roc_auc",
        "fpr",
        "fnr",
    ]:
        print(
            f"{key:30s}: "
            f"{test_result[key]:.6f}"
        )

    print()
    print("CONFUSION MATRIX")

    print(
        "TN:",
        test_result["true_negative"],
    )

    print(
        "FP:",
        test_result["false_positive"],
    )

    print(
        "FN:",
        test_result["false_negative"],
    )

    print(
        "TP:",
        test_result["true_positive"],
    )

    print()
    print("COST")

    print(
        "False-positive cost: ₹"
        f"{test_result['false_positive_cost_rupees']:,.2f}"
    )

    print(
        "False-negative exposure: ₹"
        f"{test_result['false_negative_exposure_rupees']:,.2f}"
    )

    print(
        "Expected cost: ₹"
        f"{test_result['expected_cost_rupees']:,.2f}"
    )

    METRICS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    metrics_payload = {
        "model": "sentinelpay_risk_v1",
        "threshold": threshold,
        "false_positive_cost_assumption_rupees": (
            FALSE_POSITIVE_COST_RUPEES
        ),
        "validation": validation_result,
        "test": test_result,
    }

    METRICS_FILE.write_text(
        json.dumps(
            metrics_payload,
            indent=2,
        ),
        encoding="utf-8",
    )

    save_confusion_matrix(
        y_test.to_numpy(),
        test_probabilities,
        threshold,
    )

    write_report(
        threshold,
        validation_result,
        test_result,
        len(train),
        len(validation),
        len(test),
    )

    print()
    print("OUTPUTS")

    print(METRICS_FILE)
    print(REPORT_FILE)
    print(CONFUSION_FILE)

    print()
    print("STATUS: SUCCESS")


if __name__ == "__main__":
    main()