from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]

INPUT = (
    ROOT
    / "data"
    / "processed"
    / "transactions"
    / "transactions_combined.parquet"
)

OUTPUT_DIR = ROOT / "data" / "processed" / "training"

TRAIN_FILE = OUTPUT_DIR / "train.parquet"
VALIDATION_FILE = OUTPUT_DIR / "validation.parquet"
TEST_FILE = OUTPUT_DIR / "test.parquet"


REQUIRED_COLUMNS = [
    "TRANSACTION_ID",
    "TX_DATETIME",
    "CUSTOMER_ID",
    "TERMINAL_ID",
    "TX_AMOUNT",
    "TX_TIME_SECONDS",
    "TX_TIME_DAYS",
    "TX_FRAUD",
]


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """Build leakage-safe transaction features.

    Every historical feature is calculated from transactions
    occurring BEFORE the current transaction.
    """

    df = df.copy()

    df["TX_DATETIME"] = pd.to_datetime(df["TX_DATETIME"])

    # Chronological order is essential for all historical features.
    df = df.sort_values(
        ["TX_DATETIME", "TRANSACTION_ID"]
    ).reset_index(drop=True)

    # ---------------------------------------------------------
    # Basic transaction features
    # ---------------------------------------------------------

    df["amount"] = df["TX_AMOUNT"].astype(float)

    df["hour"] = df["TX_DATETIME"].dt.hour
    df["day_of_week"] = df["TX_DATETIME"].dt.dayofweek

    # Cyclic representation of time.
    df["hour_sin"] = np.sin(
        2 * np.pi * df["hour"] / 24
    )

    df["hour_cos"] = np.cos(
        2 * np.pi * df["hour"] / 24
    )

    # ---------------------------------------------------------
    # Customer historical features
    # ---------------------------------------------------------

    customer_group = df.groupby(
        "CUSTOMER_ID",
        sort=False,
    )

    # Number of prior transactions.
    df["customer_prior_count"] = (
        customer_group.cumcount()
    )

    # Prior amount statistics, excluding current transaction.
    customer_shifted_amount = (
        customer_group["TX_AMOUNT"]
        .shift(1)
    )

    df["customer_prior_mean"] = (
        customer_shifted_amount
        .groupby(df["CUSTOMER_ID"])
        .transform("mean")
    )

    df["customer_prior_std"] = (
        customer_shifted_amount
        .groupby(df["CUSTOMER_ID"])
        .transform("std")
    )

    # Time since previous transaction for the same customer.
    previous_customer_time = (
        customer_group["TX_DATETIME"]
        .shift(1)
    )

    df["customer_time_since_previous_sec"] = (
        df["TX_DATETIME"] - previous_customer_time
    ).dt.total_seconds()

    # ---------------------------------------------------------
    # Customer amount deviation
    # ---------------------------------------------------------

    df["amount_vs_customer_mean"] = (
        df["amount"]
        / df["customer_prior_mean"].replace(
            0,
            np.nan,
        )
    )

    df["amount_zscore"] = (
        (
            df["amount"]
            - df["customer_prior_mean"]
        )
        / df["customer_prior_std"].replace(
            0,
            np.nan,
        )
    )

    # ---------------------------------------------------------
    # Terminal historical activity
    # ---------------------------------------------------------

    terminal_group = df.groupby(
        "TERMINAL_ID",
        sort=False,
    )

    df["terminal_prior_count"] = (
        terminal_group.cumcount()
    )

    # ---------------------------------------------------------
    # Customer × terminal relationship
    # ---------------------------------------------------------

    pair_group = df.groupby(
        ["CUSTOMER_ID", "TERMINAL_ID"],
        sort=False,
    )

    df["customer_terminal_prior_count"] = (
        pair_group.cumcount()
    )

    # ---------------------------------------------------------
    # Clean numerical infinities
    # ---------------------------------------------------------

    numeric_columns = [
        "amount_vs_customer_mean",
        "amount_zscore",
        "customer_time_since_previous_sec",
    ]

    for column in numeric_columns:
        df[column] = df[column].replace(
            [np.inf, -np.inf],
            np.nan,
        )

    # ---------------------------------------------------------
    # Remove fields that must NOT be model inputs
    # ---------------------------------------------------------

    # TX_FRAUD is the target.
    #
    # TX_FRAUD_SCENARIO is deliberately excluded because it is
    # closely tied to the target and would create an unrealistic
    # shortcut unavailable in a genuine prediction setting.

    feature_columns = [
        "TRANSACTION_ID",
        "TX_DATETIME",
        "CUSTOMER_ID",
        "TERMINAL_ID",
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
        "TX_FRAUD",
    ]

    return df[feature_columns].copy()


def chronological_split(
    df: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Chronological 70/15/15 split without splitting identical timestamps."""

    df = df.sort_values(
        ["TX_DATETIME", "TRANSACTION_ID"]
    ).reset_index(drop=True)

    timestamps = df["TX_DATETIME"]

    n = len(df)

    target_train_end = int(n * 0.70)
    target_validation_end = int(n * 0.85)

    # Find the timestamp at each desired row boundary.
    train_boundary_time = timestamps.iloc[target_train_end]
    validation_boundary_time = timestamps.iloc[target_validation_end]

    # Move boundaries to whole timestamp groups.
    #
    # Training contains everything strictly before the first
    # validation timestamp.
    train_mask = timestamps < train_boundary_time

    # Validation contains timestamps from the training boundary
    # up to (but not including) the test boundary.
    validation_mask = (
        (timestamps >= train_boundary_time)
        & (timestamps < validation_boundary_time)
    )

    # Test contains everything from the test boundary onward.
    test_mask = timestamps >= validation_boundary_time

    train = df.loc[train_mask].copy()
    validation = df.loc[validation_mask].copy()
    test = df.loc[test_mask].copy()

    # Safety checks.
    if len(train) == 0:
        raise ValueError("Training split is empty.")

    if len(validation) == 0:
        raise ValueError("Validation split is empty.")

    if len(test) == 0:
        raise ValueError("Test split is empty.")

    return train, validation, test
def print_split_report(
    name: str,
    df: pd.DataFrame,
) -> None:
    fraud_count = int(
        df["TX_FRAUD"].sum()
    )

    total = len(df)

    fraud_rate = (
        fraud_count / total
        if total
        else 0.0
    )

    print()
    print(name)
    print("-" * 60)
    print("Rows:", f"{total:,}")
    print("Fraud:", f"{fraud_count:,}")
    print(
        "Legitimate:",
        f"{total - fraud_count:,}",
    )
    print(
        "Fraud rate:",
        f"{fraud_rate:.4%}",
    )

    print(
        "Time:",
        df["TX_DATETIME"].min(),
        "→",
        df["TX_DATETIME"].max(),
    )


def validate_split_boundaries(
    train: pd.DataFrame,
    validation: pd.DataFrame,
    test: pd.DataFrame,
) -> None:
    train_max = train["TX_DATETIME"].max()
    validation_min = validation["TX_DATETIME"].min()
    validation_max = validation["TX_DATETIME"].max()
    test_min = test["TX_DATETIME"].min()

    if not train_max < validation_min:
        raise ValueError(
            "Training and validation periods overlap."
        )

    if not validation_max < test_min:
        raise ValueError(
            "Validation and test periods overlap."
        )


def main() -> None:
    print("=" * 70)
    print("SENTINELPAY TRAINING DATASET BUILDER")
    print("=" * 70)

    if not INPUT.exists():
        raise FileNotFoundError(
            f"Input dataset not found:\n{INPUT}"
        )

    print()
    print("Loading:")
    print(INPUT)

    df = pd.read_parquet(INPUT)

    missing_columns = [
        c
        for c in REQUIRED_COLUMNS
        if c not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            "Missing required columns: "
            + str(missing_columns)
        )

    print(
        "Raw rows:",
        f"{len(df):,}",
    )

    # Remove duplicate transaction IDs.
    before = len(df)

    df = df.drop_duplicates(
        subset=["TRANSACTION_ID"]
    )

    removed = before - len(df)

    if removed:
        print(
            "Duplicate transactions removed:",
            removed,
        )

    print()
    print("Building leakage-safe features...")

    dataset = build_features(df)

    print(
        "Feature rows:",
        f"{len(dataset):,}",
    )

    train, validation, test = chronological_split(
        dataset
    )

    validate_split_boundaries(
        train,
        validation,
        test,
    )

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    train.to_parquet(
        TRAIN_FILE,
        index=False,
    )

    validation.to_parquet(
        VALIDATION_FILE,
        index=False,
    )

    test.to_parquet(
        TEST_FILE,
        index=False,
    )

    print()
    print("=" * 70)
    print("SPLIT REPORT")
    print("=" * 70)

    print_split_report(
        "TRAIN",
        train,
    )

    print_split_report(
        "VALIDATION",
        validation,
    )

    print_split_report(
        "TEST",
        test,
    )

    print()
    print("=" * 70)
    print("FEATURES")
    print("=" * 70)

    feature_names = [
        c
        for c in train.columns
        if c != "TX_FRAUD"
    ]

    for feature in feature_names:
        print(" ", feature)

    print()
    print("=" * 70)
    print("OUTPUT")
    print("=" * 70)

    print(TRAIN_FILE)
    print(VALIDATION_FILE)
    print(TEST_FILE)

    print()
    print("STATUS: SUCCESS")


if __name__ == "__main__":
    main()