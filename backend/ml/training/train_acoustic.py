from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


def load_dataset(path: str) -> tuple[np.ndarray, np.ndarray]:

    df = pd.read_csv(path)

    feature_columns = [
        column
        for column in df.columns
        if column not in {"label", "sample_id"}
    ]

    X = df[feature_columns].values
    y = df["label"].values

    return X, y


def train(dataset_path: str, output_path: str) -> None:

    X, y = load_dataset(dataset_path)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    model = Pipeline(
        [
            ("scaler", StandardScaler()),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=300,
                    random_state=42,
                    class_weight="balanced",
                    n_jobs=-1,
                ),
            ),
        ]
    )

    model.fit(X_train, y_train)

    probabilities = model.predict_proba(X_test)[:, 1]
    predictions = (probabilities >= 0.5).astype(int)

    print(
        classification_report(
            y_test,
            predictions,
            digits=4,
        )
    )

    print(
        "ROC-AUC:",
        roc_auc_score(y_test, probabilities),
    )

    Path(output_path).parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        {
            "model": model,
            "feature_columns": [
                column
                for column in pd.read_csv(dataset_path).columns
                if column not in {"label", "sample_id"}
            ],
        },
        output_path,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument("--dataset", required=True)
    parser.add_argument("--output", required=True)

    args = parser.parse_args()

    train(
        args.dataset,
        args.output,
    )