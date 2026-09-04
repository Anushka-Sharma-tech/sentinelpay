from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

import joblib
import numpy as np

ROOT = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    ROOT
    / "models"
    / "sentinelpay_risk_v1.pkl"
)


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


class RiskAnalyzer:
    def __init__(self) -> None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Risk model not found: {MODEL_PATH}"
            )

        self.model = joblib.load(MODEL_PATH)

        manifest_path = (
            ROOT
            / "models"
            / "manifests"
            / "sentinelpay-v1.json"
        )

        self.model_version = "sentinelpay-v1"

        if manifest_path.exists():
            try:
                manifest = json.loads(
                    manifest_path.read_text(
                        encoding="utf-8"
                    )
                )

                self.model_version = manifest.get(
                    "version",
                    self.model_version,
                )
            except Exception:
                pass

    @staticmethod
    def _number(
        value: Any,
        default: float = 0.0,
    ) -> float:
        try:
            if value is None:
                return default

            result = float(value)

            if not np.isfinite(result):
                return default

            return result

        except (TypeError, ValueError):
            return default

    @staticmethod
    def _int(
        value: Any,
        default: int = 0,
    ) -> int:
        try:
            return int(value)

        except (TypeError, ValueError):
            return default

    def build_features(
        self,
        transaction: dict[str, Any],
    ) -> np.ndarray:

        amount = self._number(
            transaction.get("amount"),
        )

        hour = self._int(
            transaction.get("hour"),
            12,
        )

        day_of_week = self._int(
            transaction.get("day_of_week"),
            0,
        )

        customer_prior_count = self._int(
            transaction.get(
                "customer_prior_count",
                0,
            )
        )

        customer_prior_mean = self._number(
            transaction.get(
                "customer_prior_mean",
                0.0,
            )
        )

        customer_prior_std = self._number(
            transaction.get(
                "customer_prior_std",
                0.0,
            )
        )

        time_since_previous = self._number(
            transaction.get(
                "customer_time_since_previous_sec",
                3600.0,
            ),
            3600.0,
        )

        terminal_prior_count = self._int(
            transaction.get(
                "terminal_prior_count",
                0,
            )
        )

        customer_terminal_prior_count = self._int(
            transaction.get(
                "customer_terminal_prior_count",
                0,
            )
        )

        tx_time_seconds = self._number(
            transaction.get(
                "TX_TIME_SECONDS",
                0.0,
            )
        )

        tx_time_days = self._number(
            transaction.get(
                "TX_TIME_DAYS",
                0.0,
            )
        )

        hour_sin = np.sin(
            2.0 * np.pi * hour / 24.0
        )

        hour_cos = np.cos(
            2.0 * np.pi * hour / 24.0
        )

        if customer_prior_mean > 0:
            amount_vs_customer_mean = (
                amount / customer_prior_mean
            )
        else:
            amount_vs_customer_mean = 0.0

        if customer_prior_std > 0:
            amount_zscore = (
                (amount - customer_prior_mean)
                / customer_prior_std
            )
        else:
            amount_zscore = 0.0

        values = {
            "amount": amount,
            "hour": hour,
            "day_of_week": day_of_week,
            "hour_sin": hour_sin,
            "hour_cos": hour_cos,
            "customer_prior_count": customer_prior_count,
            "customer_prior_mean": customer_prior_mean,
            "customer_prior_std": customer_prior_std,
            "customer_time_since_previous_sec": time_since_previous,
            "amount_vs_customer_mean": amount_vs_customer_mean,
            "amount_zscore": amount_zscore,
            "terminal_prior_count": terminal_prior_count,
            "customer_terminal_prior_count": customer_terminal_prior_count,
            "TX_TIME_SECONDS": tx_time_seconds,
            "TX_TIME_DAYS": tx_time_days,
        }

        row = []

        for feature in FEATURES:
            value = float(values[feature])

            if not np.isfinite(value):
                value = 0.0

            row.append(value)

        return np.asarray(
            row,
            dtype=np.float64,
        ).reshape(1, -1)

    def analyze(
        self,
        transaction: dict[str, Any],
    ) -> dict[str, Any]:

        started = time.perf_counter()

        features = self.build_features(
            transaction
        )

        probability = float(
            self.model.predict_proba(features)[
                0,
                1,
            ]
        )

        probability = float(
            np.clip(
                probability,
                0.0,
                1.0,
            )
        )

        # Validation-selected intervention point.
        # This is the point selected during evaluation.
        review_threshold = 0.25

        # Conservative operational block threshold.
        block_threshold = 0.60

        if probability < review_threshold:
            risk_level = "LOW"
            decision = "ALLOW"

        elif probability < block_threshold:
            risk_level = "MEDIUM"
            decision = "REVIEW"

        else:
            risk_level = "HIGH"
            decision = "BLOCK"

        factors = []

        amount = self._number(
            transaction.get("amount")
        )

        historical_average = self._number(
            transaction.get(
                "customer_prior_mean",
                transaction.get(
                    "historical_average",
                    0.0,
                ),
            )
        )

        recent_count = self._int(
            transaction.get(
                "customer_terminal_prior_count",
                transaction.get(
                    "recent_transaction_count",
                    0,
                ),
            )
        )

        if (
            historical_average > 0
            and amount > historical_average * 2
        ):
            deviation = amount / historical_average

            factors.append(
                {
                    "name": "amount_deviation",
                    "category": "transaction",
                    "contribution": min(
                        1.0,
                        (deviation - 1.0) / 4.0,
                    ),
                    "evidence": (
                        f"Amount is {deviation:.1f}× "
                        "the customer's historical average."
                    ),
                }
            )

        if recent_count >= 3:
            factors.append(
                {
                    "name": "transaction_velocity",
                    "category": "behaviour",
                    "contribution": min(
                        1.0,
                        recent_count / 10.0,
                    ),
                    "evidence": (
                        f"{recent_count} recent "
                        "transactions in the supplied history."
                    ),
                }
            )

        customer_prior_count = self._int(
            transaction.get(
                "customer_prior_count",
                0,
            )
        )

        if customer_prior_count == 0:
            factors.append(
                {
                    "name": "new_customer_history",
                    "category": "behaviour",
                    "contribution": 0.15,
                    "evidence": (
                        "No prior customer transaction "
                        "history was supplied."
                    ),
                }
            )

        is_new_recipient = bool(
            transaction.get(
                "is_new_recipient",
                False,
            )
        )

        if is_new_recipient:
            factors.append(
                {
                    "name": "new_recipient",
                    "category": "transaction",
                    "contribution": 0.20,
                    "evidence": (
                        "Recipient is marked as new."
                    ),
                }
            )

        if not factors:
            factors.append(
                {
                    "name": "model_assessment",
                    "category": "model",
                    "contribution": probability,
                    "evidence": (
                        "Risk assessment is based on "
                        "the trained transaction model."
                    ),
                }
            )

        latency_ms = (
            time.perf_counter() - started
        ) * 1000.0

        return {
            "risk_score": probability,
            "risk_level": risk_level,
            "decision": decision,
            "signals": {
                "acoustic": 0.0,
                "prosody": 0.0,
                "speaker": 0.0,
                "context": 0.0,
                "transaction": probability,
                "behaviour": probability,
            },
            "factors": factors,
            "model_version": self.model_version,
            "calibrated": False,
            "latency_ms": latency_ms,
        }


risk_analyzer = RiskAnalyzer()