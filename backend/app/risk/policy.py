from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RiskPolicy:
    review_threshold: float = 0.25
    block_threshold: float = 0.60

    def __post_init__(self) -> None:
        if not 0.0 <= self.review_threshold <= 1.0:
            raise ValueError(
                "review_threshold must be between 0 and 1"
            )

        if not 0.0 <= self.block_threshold <= 1.0:
            raise ValueError(
                "block_threshold must be between 0 and 1"
            )

        if self.review_threshold >= self.block_threshold:
            raise ValueError(
                "review_threshold must be lower than block_threshold"
            )


DEFAULT_POLICY = RiskPolicy()


def classify_risk(
    risk_score: float,
    policy: RiskPolicy = DEFAULT_POLICY,
) -> tuple[str, str]:
    if not 0.0 <= risk_score <= 1.0:
        raise ValueError(
            "risk_score must be between 0 and 1"
        )

    if risk_score < policy.review_threshold:
        return "LOW", "ALLOW"

    if risk_score < policy.block_threshold:
        return "MEDIUM", "REVIEW"

    return "HIGH", "BLOCK"